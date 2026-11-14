$ErrorActionPreference = 'Stop'
$changes = Get-Content publication\patches.json -Raw -Encoding utf8 | ConvertFrom-Json
$index = 0
foreach ($change in $changes) {
    $index++
    $resultFile = 'publication/patches/{0:d3}-result.json' -f $index
    if (Test-Path -LiteralPath $resultFile) {
        $saved = Get-Content -LiteralPath $resultFile -Raw -Encoding utf8 | ConvertFrom-Json
        if ($saved.ok -and $saved.data.result -eq 'success') { continue }
    }
    $contentFile = '@' + $change.file
    $result = & lark-cli docs +update --doc $change.doc --command str_replace --pattern $change.pattern --content $contentFile --as user
    $result | Set-Content -LiteralPath $resultFile -Encoding utf8
    $parsed = $result | ConvertFrom-Json
    if (-not $parsed.ok -or $parsed.data.result -ne 'success' -or ($null -ne $parsed.data.updated_blocks_count -and $parsed.data.updated_blocks_count -lt 1)) {
        throw "第 $index 处更新失败，请检查 $resultFile"
    }
    Write-Output "已更新 $index / $($changes.Count)"
}
