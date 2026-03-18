package tray

/*
#cgo CFLAGS: -x objective-c
#cgo LDFLAGS: -framework Cocoa
#include "tray_darwin.h"
*/
import "C"
import "unsafe"

//export goTrayMenuClicked
func goTrayMenuClicked(itemID C.int) {
	switch int(itemID) {
	case 0:
		if cbs.OnToggleVanish != nil {
			cbs.OnToggleVanish()
		}
	case 1:
		if cbs.OnOpenConfig != nil {
			cbs.OnOpenConfig()
		}
	case 2:
		if cbs.OnQuit != nil {
			cbs.OnQuit()
		}
	}
}

func Init(_ string, _ []byte, cb Callbacks) {
	cbs = cb
}

func Start(version string, icon []byte) {
	tooltip := C.CString("Ghost Chat " + version)
	versionLabel := C.CString("Ghost Chat " + version)
	toggleLabel := C.CString("Toggle Vanish")
	configLabel := C.CString("Open Config Folder")
	quitLabel := C.CString("Quit")

	C.createTrayOnMain(
		unsafe.Pointer(&icon[0]), C.int(len(icon)),
		tooltip, versionLabel, toggleLabel, configLabel, quitLabel,
	)
}

func Stop() {
	C.removeTray()
}
