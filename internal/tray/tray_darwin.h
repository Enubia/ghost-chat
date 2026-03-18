#ifndef TRAY_DARWIN_H
#define TRAY_DARWIN_H

void createTrayOnMain(const void *iconData, int iconLen, const char *tooltip,
	const char *versionLabel, const char *toggleLabel,
	const char *configLabel, const char *quitLabel);

void removeTray(void);

#endif
