const fs     = require('fs')
const path   = require('path')
const crypto = require('crypto')

const BG_ROOT = path.join(__dirname, 'backgrounds')
const JS_FILE = path.join(__dirname, 'backgrounds.js')

const urlPattern = /url:\s*`\$\{BASE_URL\}\/backgrounds\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)\.(jpg|jpeg|png)`/

let renamed = 0, skippedFree = 0, skippedMissing = 0

const lines = fs.readFileSync(JS_FILE, 'utf8').split('\n')

const updatedLines = lines.map(line => {
    const match = line.match(urlPattern)
    if (!match) return line

    const isPro = /isPro:\s*true/.test(line)
    if (!isPro) { skippedFree++; return line }

    const [, category, baseName, ext] = match
    const oldPath = path.join(BG_ROOT, category, baseName + '.' + ext)

    if (!fs.existsSync(oldPath)) {
        console.warn('MISSING ON DISK, skipped:', oldPath)
        skippedMissing++
        return line
    }

    const newFile = crypto.randomBytes(6).toString('hex') + '.' + ext
    fs.renameSync(oldPath, path.join(BG_ROOT, category, newFile))
    renamed++

    return line.replace(
        urlPattern,
        'url: `${BASE_URL}/backgrounds/' + category + '/' + newFile + '`'
    )
})

fs.writeFileSync(JS_FILE, updatedLines.join('\n'), 'utf8')

console.log('Renamed (Pro only):', renamed)
console.log('Left as free (untouched):', skippedFree)
console.log('Missing on disk:', skippedMissing)
