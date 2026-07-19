#!/usr/bin/env node

import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

function usage() {
  console.error('Usage: node scripts/validate-artifact-contract.mjs --template <path> --artifact <path> [--json]')
  process.exit(2)
}

function parseArguments(argv) {
  const options = { json: false }
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--json') {
      options.json = true
      continue
    }
    if (arg === '--template' || arg === '--artifact') {
      options[arg.slice(2)] = argv[index + 1]
      index += 1
      continue
    }
    usage()
  }
  if (!options.template || !options.artifact) usage()
  return options
}

function parseFrontmatter(content, source) {
  if (!content.startsWith('---\n')) {
    throw new Error(`${source} must start with YAML frontmatter`)
  }

  const end = content.indexOf('\n---\n', 4)
  if (end < 0) {
    throw new Error(`${source} frontmatter is not closed`)
  }

  const frontmatter = content.slice(4, end).split('\n')
  const contract = {}
  let currentArray = null

  for (const line of frontmatter) {
    const scalar = line.match(/^([A-Za-z][A-Za-z0-9]*):\s*(.+)$/)
    if (scalar) {
      contract[scalar[1]] = scalar[2].replace(/^['"]|['"]$/g, '')
      currentArray = null
      continue
    }

    const key = line.match(/^([A-Za-z][A-Za-z0-9]*):\s*$/)
    if (key) {
      contract[key[1]] = []
      currentArray = key[1]
      continue
    }

    const item = line.match(/^\s+-\s+(.+)$/)
    if (item && currentArray) {
      contract[currentArray].push(item[1].replace(/^['"]|['"]$/g, ''))
      continue
    }

    throw new Error(`${source} has unsupported frontmatter line: ${line}`)
  }

  return {
    contract,
    body: content.slice(end + 5),
  }
}

function headingSet(markdown) {
  return new Set(
    [...markdown.matchAll(/^#{1,6}\s+(.+)$/gm)].map((match) => match[1].trim()),
  )
}

function resultFor(templatePath, artifactPath, templateContent, contract, artifactBody) {
  const headings = headingSet(artifactBody)
  const missingHeadings = (contract.requiredHeadings ?? []).filter((heading) => !headings.has(heading))
  const invalidPatterns = []

  for (const source of contract.requiredPatterns ?? []) {
    let pattern
    try {
      pattern = new RegExp(source, 'm')
    } catch {
      invalidPatterns.push(`Invalid template pattern: ${source}`)
      continue
    }
    if (!pattern.test(artifactBody)) invalidPatterns.push(source)
  }

  return {
    artifact: contract.artifact ?? null,
    contractVersion: Number(contract.contractVersion ?? 0),
    template: templatePath,
    artifactPath,
    templateDigest: `sha256:${createHash('sha256').update(templateContent).digest('hex')}`,
    passed: missingHeadings.length === 0 && invalidPatterns.length === 0,
    missingHeadings,
    invalidPatterns,
  }
}

async function main() {
  const options = parseArguments(process.argv.slice(2))
  const templatePath = resolve(options.template)
  const artifactPath = resolve(options.artifact)
  const [templateContent, artifactContent] = await Promise.all([
    readFile(templatePath, 'utf8'),
    readFile(artifactPath, 'utf8'),
  ])
  const { contract } = parseFrontmatter(templateContent, templatePath)
  const { body } = parseFrontmatter(artifactContent, artifactPath)
  const result = resultFor(templatePath, artifactPath, templateContent, contract, body)

  if (options.json) {
    console.log(JSON.stringify(result))
  } else if (result.passed) {
    console.log(`PASS ${result.artifact} (${result.contractVersion}) ${artifactPath}`)
  } else {
    console.error(`FAIL ${result.artifact} ${artifactPath}`)
    if (result.missingHeadings.length) console.error(`Missing headings: ${result.missingHeadings.join(', ')}`)
    if (result.invalidPatterns.length) console.error(`Pattern failures: ${result.invalidPatterns.join(', ')}`)
  }

  process.exit(result.passed ? 0 : 1)
}

main().catch((error) => {
  console.error(`Artifact contract validation failed: ${error.message}`)
  process.exit(1)
})
