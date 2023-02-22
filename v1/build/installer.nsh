!macro checkInstOldGUIDFormat
	; Caused by changes in electron-builder in the PR 4069
	; See issue https://github.com/electron-userland/electron-builder/issues/4092
	; Note: Previously they switched from ### to {###} format, so we had to remove the version without curly braces.
	;       Recently they switched from {###} back to the ### format, reintroducing the bug... So now we have to fix it in reverse.

	; Check whether there is a user installation with the old GUID format in registry and delete it
	ReadRegStr $0 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\{${UNINSTALL_APP_KEY}}" "QuietUninstallString"
	StrCmp $0 "" 0 0
	DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\{${UNINSTALL_APP_KEY}}"

	; Check whether there is an admin installation with the old GUID format in registry and delete it
	ReadRegStr $0 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\{${UNINSTALL_APP_KEY}}" "QuietUninstallString"
	StrCmp $0 "" proceed 0
	DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\{${UNINSTALL_APP_KEY}}"

	proceed:
!macroend

!macro customInit
	; check whether there is an existing installation with the old GUID in registry
	!insertmacro "checkInstOldGUIDFormat"
!macroend
