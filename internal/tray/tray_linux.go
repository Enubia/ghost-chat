package tray

func Init(_ string, _ []byte, cb Callbacks) {
	cbs = cb
}

func Start(_ string, _ []byte) {}

func Stop() {}
