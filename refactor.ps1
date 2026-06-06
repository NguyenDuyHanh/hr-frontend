$srcDir = "d:\personal_workspace\HRM\hrm-frontend-new\src"

$uiComponents = @(
  "UiAsyncAutocomplete",
  "UiAutocomplete",
  "UiAvatar",
  "UiCheckBox",
  "UiConfirmationDialog",
  "UiDateTimePicker",
  "UiEditor",
  "UiFilterPanel",
  "UiImageUpload",
  "UiListToolbar",
  "UiLoading",
  "UiNumberInput",
  "UiPagination",
  "UiPaginationOptionPopup",
  "UiPagingAutocomplete",
  "UiPagingAutocompleteV2",
  "UiPagingCheckboxDetail",
  "UiPopup",
  "UiRequiredLabel",
  "UiSearchInput",
  "UiSelectInput",
  "UiSelectInputV2",
  "UiTable",
  "UiTextField",
  "UiVNDCurrencyInput"
)

# Get all .js and .jsx files
$allFiles = Get-ChildItem -Path $srcDir -Filter *.js* -Recurse | Where-Object { $_.Extension -eq ".js" -or $_.Extension -eq ".jsx" }

foreach ($file in $allFiles) {
    $filePath = $file.FullName
    $content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
    $originalContent = $content
    $fileName = $file.Name

    # 1. Apply special namespace conflict resolutions inside the custom component definitions first
    if ($fileName -eq "UiTextField.jsx") {
        Write-Host "Resolving MUI TextField import inside UiTextField.jsx..."
        $content = $content.Replace('import TextField from "@mui/material/TextField";', 'import MuiTextField from "@mui/material/TextField";')
        $content = $content.Replace('<TextField', '<MuiTextField')
        $content = $content.Replace('</TextField', '</MuiTextField')
    }
    elseif ($fileName -eq "UiAutocomplete.jsx") {
        Write-Host "Resolving MUI Autocomplete import inside UiAutocomplete.jsx..."
        $content = $content.Replace('import Autocomplete from "@mui/material/Autocomplete";', 'import MuiAutocomplete from "@mui/material/Autocomplete";')
        $content = $content.Replace('<Autocomplete', '<MuiAutocomplete')
        $content = $content.Replace('</Autocomplete', '</MuiAutocomplete')
    }
    elseif ($fileName -eq "UiDateTimePicker.jsx") {
        Write-Host "Resolving MUI DateTimePicker import inside UiDateTimePicker.jsx..."
        $content = $content.Replace('import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";', 'import { DateTimePicker as MuiDateTimePicker } from "@mui/x-date-pickers/DateTimePicker";')
        # Replace standalone DateTimePicker (MUI picker value) with MuiDateTimePicker
        $content = $content -replace '(?<!Ui|My)\bDateTimePicker\b(?!\s+as\b)', 'MuiDateTimePicker'
    }
    elseif ($fileName -eq "UiPagination.jsx") {
        Write-Host "Resolving MUI Pagination import inside UiPagination.jsx..."
        $content = $content.Replace('import Pagination from "@mui/material/Pagination";', 'import MuiPagination from "@mui/material/Pagination";')
        $content = $content.Replace('<Pagination', '<MuiPagination')
        $content = $content.Replace('</Pagination', '</MuiPagination')
    }
    elseif ($fileName -eq "UiCheckBox.jsx") {
        Write-Host "Resolving MUI Checkbox import inside UiCheckBox.jsx..."
        $content = $content.Replace('import Checkbox from "@mui/material/Checkbox";', 'import MuiCheckbox from "@mui/material/Checkbox";')
        $content = $content.Replace('<Checkbox', '<MuiCheckbox')
        $content = $content.Replace('</Checkbox', '</MuiCheckbox')
    }

    # Clean up UserForm.jsx unused MUI TextField import
    if ($fileName -eq "UserForm.jsx") {
        Write-Host "Removing unused MUI TextField import from UserForm.jsx..."
        $content = $content.Replace("import { Button, Grid, TextField } from '@mui/material';", "import { Button, Grid } from '@mui/material';")
    }

    # 2. Replace all component usages globally
    foreach ($oldName in $uiComponents) {
        $newName = $oldName.Substring(2)
        $pattern = "\b$oldName\b"
        $content = $content -replace $pattern, $newName
    }

    # If changes made, write back
    if ($content -ne $originalContent) {
        [System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
        Write-Host "Updated: $filePath"
    }
}

# 3. Rename the component files themselves
$uiDir = Join-Path $srcDir "components\ui"
foreach ($oldName in $uiComponents) {
    $newName = $oldName.Substring(2)
    $oldPath = Join-Path $uiDir "$oldName.jsx"
    $newPath = Join-Path $uiDir "$newName.jsx"

    if (Test-Path $oldPath) {
        Rename-Item -Path $oldPath -NewName "$newName.jsx" -Force
        Write-Host "Renamed: $oldName.jsx -> $newName.jsx"
    }
}

Write-Host "Refactoring completed successfully!"
