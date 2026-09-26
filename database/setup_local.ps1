# Optional Windows setup using an isolated PostgreSQL cluster on port 55432.
# Does not modify an existing PostgreSQL service or database.
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$pgBin = 'C:/Program Files/PostgreSQL/18/bin'
$dataDirectory = Join-Path $projectRoot '.local-postgres'
if (!(Test-Path (Join-Path $pgBin 'initdb.exe'))) { throw 'PostgreSQL 18 is required at C:/Program Files/PostgreSQL/18.' }
if (!(Test-Path $dataDirectory)) {
    $passwordFile = Join-Path $env:TEMP ('moneybeing-pg-' + [guid]::NewGuid().ToString() + '.txt')
    try {
        [IO.File]::WriteAllText($passwordFile, 'moneybeing')
        & "$pgBin/initdb.exe" -D $dataDirectory -U moneybeing -A scram-sha-256 --pwfile=$passwordFile -E UTF8 --locale=C
        if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL initialization failed.' }
        Add-Content (Join-Path $dataDirectory 'postgresql.conf') "`nlisten_addresses = '127.0.0.1'`nport = 55432"
    } finally { Remove-Item -LiteralPath $passwordFile -ErrorAction SilentlyContinue }
}
& "$pgBin/pg_ctl.exe" -D $dataDirectory status
if ($LASTEXITCODE -ne 0) {
    & "$pgBin/pg_ctl.exe" -D $dataDirectory -l (Join-Path $dataDirectory 'server.log') -w start
    if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL startup failed.' }
}
$previousPassword = $env:PGPASSWORD
try {
    $env:PGPASSWORD = 'moneybeing'
    foreach ($databaseName in @('moneybeing', 'moneybeing_test')) {
        $exists = & "$pgBin/psql.exe" -h 127.0.0.1 -p 55432 -U moneybeing -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$databaseName'"
        if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL connection failed.' }
        if ($exists -ne '1') {
            & "$pgBin/createdb.exe" -h 127.0.0.1 -p 55432 -U moneybeing $databaseName
            if ($LASTEXITCODE -ne 0) { throw 'Database creation failed.' }
        }
    }
} finally { $env:PGPASSWORD = $previousPassword }
Write-Host 'Local PostgreSQL ready at 127.0.0.1:55432. Use this port in backend/.env.'
