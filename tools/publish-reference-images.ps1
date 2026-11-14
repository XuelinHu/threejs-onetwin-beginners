$ErrorActionPreference = 'Stop'
$documents = Get-Content publication\documents.json -Raw -Encoding utf8 | ConvertFrom-Json
$index = 0
foreach ($document in $documents) {
    if (-not $document.templateId) { continue }
    $index++
    $doc = $document.documentId
    $old = Get-Content "publication/$doc-image-readback.json" -Raw -Encoding utf8 | ConvertFrom-Json
    $match = [regex]::Match($old.data.document.content, '<img\b[^>]+/>')
    $imageXml = $match.Value
    $block = [regex]::Match($imageXml, ' id="([^"]+)"').Groups[1].Value
    $imageXml = [regex]::Replace($imageXml, ' id="[^"]+"', '')
    $imageXml = [regex]::Replace($imageXml, 'caption="[^"]*"', 'caption="组件拆解页 replica.html 的教学版本；完整入口的原站组件截图见下图。"')
    $xmlFile = "publication/$doc-learning-image.xml"
    $imageXml | Set-Content -LiteralPath $xmlFile -Encoding utf8
    $labelFile = "publication/$doc-learning-image-result.json"
    $labelDone = $false
    if (Test-Path -LiteralPath $labelFile) {
        $saved = Get-Content $labelFile -Raw -Encoding utf8 | ConvertFrom-Json
        $labelDone = $saved.ok -and $saved.data.result -eq 'success'
    }
    if (-not $labelDone) {
        $updated = & lark-cli docs +update --doc $doc --command block_replace --block-id $block --content "@$xmlFile" --as user
        $updated | Set-Content $labelFile -Encoding utf8
        $parsed = $updated | ConvertFrom-Json
        if (-not $parsed.ok -or $parsed.data.result -ne 'success') { throw "$doc 的教学图片说明更新失败" }
    }
    $imageFile = 'publication/screenshots/reference-verified-{0:d2}.png' -f $index
    $inserted = & lark-cli docs +media-insert --doc $doc --file $imageFile --width 1000 --align center --caption '完整入口：使用原站公开组件与原始素材，保留原版布局与交互；时钟和动画随时间变化。' --as user
    $inserted | Set-Content "publication/$doc-reference-image.json" -Encoding utf8
    $parsed = $inserted | ConvertFrom-Json
    if (-not $parsed.ok) { throw "$doc 的完整入口截图上传失败" }
    Write-Output "$index / 5 已更新教学图说明并加入完整入口截图"
}
