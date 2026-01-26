$http = [System.Net.HttpListener]::new()
$http.Prefixes.Add("http://localhost:3001/")
$http.Start()
Write-Host "Servidor rodando em http://localhost:3001/"
Write-Host "Acesse http://localhost:3001/index.html"

while ($http.IsListening) {
    $context = $http.GetContext()
    $request = $context.Request
    $response = $context.Response
    
    $localPath = $request.Url.LocalPath
    if ($localPath -eq "/") { $localPath = "/index.html" }
    
    $filePath = Join-Path "." $localPath.TrimStart("/")
    
    if (Test-Path $filePath) {
        $content = [System.IO.File]::ReadAllBytes($filePath)
        $ext = [System.IO.Path]::GetExtension($filePath)
        $contentType = switch ($ext) {
            ".html" { "text/html; charset=utf-8" }
            ".js" { "application/javascript; charset=utf-8" }
            ".css" { "text/css; charset=utf-8" }
            ".csv" { "text/csv; charset=utf-8" }
            ".json" { "application/json; charset=utf-8" }
            default { "application/octet-stream" }
        }
        $response.ContentType = $contentType
        $response.ContentLength64 = $content.Length
        $response.OutputStream.Write($content, 0, $content.Length)
    } else {
        $response.StatusCode = 404
        $msg = [System.Text.Encoding]::UTF8.GetBytes("Not Found")
        $response.OutputStream.Write($msg, 0, $msg.Length)
    }
    $response.Close()
}
