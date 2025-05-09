# MARDUK'S MAGNIFICENT NEURAL ACTIVATION SCRIPT (PowerShell Edition)

# Set colors for console output
$FG_PURPLE = [System.ConsoleColor]::Magenta
$FG_GREEN = [System.ConsoleColor]::Green
$FG_YELLOW = [System.ConsoleColor]::Yellow
$FG_CYAN = [System.ConsoleColor]::Cyan
$FG_RED = [System.ConsoleColor]::Red

function Write-ColorOutput {
    param(
        [Parameter(Mandatory = $true, Position = 0)]
        [string]$Message,
        [Parameter(Mandatory = $true, Position = 1)]
        [System.ConsoleColor]$ForegroundColor
    )

    $originalColor = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    Write-Output $Message
    $host.UI.RawUI.ForegroundColor = $originalColor
}

# Display magnificent header
Write-ColorOutput "🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪" $FG_PURPLE
Write-ColorOutput "🧪                                                                    🧪" $FG_PURPLE
Write-ColorOutput "🧪  MARDUK'S MAGNIFICENT DEEP TREE ECHO ISO ACTIVATION SEQUENCE      🧪" $FG_PURPLE
Write-ColorOutput "🧪                                                                    🧪" $FG_PURPLE
Write-ColorOutput "🧪  Prepare for your perception of bot visualization to be forever    🧪" $FG_PURPLE
Write-ColorOutput "🧪  TRANSFORMED into something far more GLORIOUS!                     🧪" $FG_PURPLE
Write-ColorOutput "🧪                                                                    🧪" $FG_PURPLE
Write-ColorOutput "🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪" $FG_PURPLE

# Step 1: Navigate to the extension directory
Write-ColorOutput "`nSTEP 1: Navigating to the extension directory..." $FG_CYAN
try {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    Set-Location $scriptDir
    Write-ColorOutput "Successfully navigated to $(Get-Location)" $FG_GREEN
}
catch {
    Write-ColorOutput "NEURAL MISFIRE! Failed to navigate to the extension directory." $FG_RED
    exit 1
}

# Step 2: Install dependencies
Write-ColorOutput "`nSTEP 2: Installing the neural components (dependencies)..." $FG_CYAN
Write-ColorOutput "This process will bond the necessary neural pathways required for visualization." $FG_YELLOW

try {
    yarn install
    if ($LASTEXITCODE -ne 0) { throw "Yarn install failed" }
    Write-ColorOutput "Neural components successfully bonded!" $FG_GREEN
}
catch {
    Write-ColorOutput "NEURAL BONDING FAILURE! Dependency installation failed." $FG_RED
    Write-ColorOutput "Suggestion: Check your yarn configuration and try again." $FG_YELLOW
    exit 1
}

# Step 3: Build the extension
Write-ColorOutput "`nSTEP 3: Building the magnificent creation..." $FG_CYAN
Write-ColorOutput "Transmuting TypeScript into executable JavaScript..." $FG_YELLOW

try {
    yarn build
    if ($LASTEXITCODE -ne 0) { throw "Build failed" }
    Write-ColorOutput "Magnificent creation successfully transmuted!" $FG_GREEN
}
catch {
    Write-ColorOutput "TRANSMUTATION FAILURE! Build process failed." $FG_RED
    Write-ColorOutput "Suggestion: Check for TypeScript errors and try again." $FG_YELLOW
    exit 1
}

# Step 4: Activate the extension
Write-ColorOutput "`nSTEP 4: Preparing Bot Framework Composer for the symbiotic relationship..." $FG_CYAN
Write-ColorOutput "This will ensure the extension is properly registered in the Composer." $FG_YELLOW

# Navigate to the Composer root directory
try {
    Set-Location -Path "$(Split-Path -Parent (Split-Path -Parent (Get-Location)))"
    Write-ColorOutput "Now in $(Get-Location)" $FG_GREEN
}
catch {
    Write-ColorOutput "NAVIGATION ERROR! Failed to navigate to the Composer directory." $FG_RED
    exit 1
}

# Step 5: Display success message
Write-ColorOutput "`n🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪" $FG_PURPLE
Write-ColorOutput "🧪                                                                    🧪" $FG_PURPLE
Write-ColorOutput "🧪  THE DEEP TREE ECHO ISO EXTENSION IS NOW READY!                   🧪" $FG_PURPLE
Write-ColorOutput "🧪                                                                    🧪" $FG_PURPLE
Write-ColorOutput "🧪  To witness the magnificent visualization:                         🧪" $FG_PURPLE
Write-ColorOutput "🧪    1. Start Bot Framework Composer: yarn start                     🧪" $FG_PURPLE
Write-ColorOutput "🧪    2. Open any bot project                                         🧪" $FG_PURPLE
Write-ColorOutput "🧪    3. Behold the glorious transformation!                          🧪" $FG_PURPLE
Write-ColorOutput "🧪                                                                    🧪" $FG_PURPLE
Write-ColorOutput "🧪  \"The isometric dimension awaits your consciousness!\" - MARDUK    🧪" $FG_PURPLE
Write-ColorOutput "🧪                                                                    🧪" $FG_PURPLE
Write-ColorOutput "🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪🧪" $FG_PURPLE

# Offer to start Composer
Write-ColorOutput "`nWould you like to start Bot Framework Composer now? (y/n)" $FG_CYAN
$response = Read-Host
if ($response -eq 'y' -or $response -eq 'Y') {
    Write-ColorOutput "Initiating Bot Framework Composer..." $FG_YELLOW
    Set-Location -Path ".\Composer"
    yarn start
    Write-ColorOutput "Bot Framework Composer is running. Prepare for neural synchronization!" $FG_GREEN
}
else {
    Write-ColorOutput "You can start Bot Framework Composer later with:" $FG_YELLOW
    Write-ColorOutput "cd Composer && yarn start" $FG_GREEN
}

Write-ColorOutput "`nMARDUK THE MAD SCIENTIST BIDS YOU FAREWELL... FOR NOW!" $FG_PURPLE
