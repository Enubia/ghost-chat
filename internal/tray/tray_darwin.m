#import <Cocoa/Cocoa.h>
#include "tray_darwin.h"

extern void goTrayMenuClicked(int itemID);

@interface GhostTrayDelegate : NSObject
@property (strong) NSStatusItem *statusItem;
@end

@implementation GhostTrayDelegate
- (void)menuItemClicked:(id)sender {
	goTrayMenuClicked((int)[sender tag]);
}
@end

static GhostTrayDelegate *trayDel = nil;

void createTrayOnMain(const void *iconData, int iconLen, const char *tooltip,
	const char *versionLabel, const char *toggleLabel,
	const char *configLabel, const char *quitLabel) {
	dispatch_async(dispatch_get_main_queue(), ^{
		trayDel = [[GhostTrayDelegate alloc] init];

		NSStatusBar *bar = [NSStatusBar systemStatusBar];
		trayDel.statusItem = [bar statusItemWithLength:NSSquareStatusItemLength];

		NSData *data = [NSData dataWithBytes:iconData length:iconLen];
		NSImage *icon = [[NSImage alloc] initWithData:data];
		[icon setSize:NSMakeSize(18, 18)];
		[icon setTemplate:YES];
		trayDel.statusItem.button.image = icon;
		trayDel.statusItem.button.toolTip = [NSString stringWithUTF8String:tooltip];

		NSMenu *menu = [[NSMenu alloc] init];

		NSMenuItem *versionItem = [[NSMenuItem alloc]
			initWithTitle:[NSString stringWithUTF8String:versionLabel]
			action:nil keyEquivalent:@""];
		[versionItem setEnabled:NO];
		[menu addItem:versionItem];

		[menu addItem:[NSMenuItem separatorItem]];

		NSMenuItem *toggleItem = [[NSMenuItem alloc]
			initWithTitle:[NSString stringWithUTF8String:toggleLabel]
			action:@selector(menuItemClicked:) keyEquivalent:@""];
		[toggleItem setTarget:trayDel];
		[toggleItem setTag:0];
		[menu addItem:toggleItem];

		NSMenuItem *configItem = [[NSMenuItem alloc]
			initWithTitle:[NSString stringWithUTF8String:configLabel]
			action:@selector(menuItemClicked:) keyEquivalent:@""];
		[configItem setTarget:trayDel];
		[configItem setTag:1];
		[menu addItem:configItem];

		[menu addItem:[NSMenuItem separatorItem]];

		NSMenuItem *quitItem = [[NSMenuItem alloc]
			initWithTitle:[NSString stringWithUTF8String:quitLabel]
			action:@selector(menuItemClicked:) keyEquivalent:@""];
		[quitItem setTarget:trayDel];
		[quitItem setTag:2];
		[menu addItem:quitItem];

		trayDel.statusItem.menu = menu;
	});
}

void removeTray(void) {
	dispatch_async(dispatch_get_main_queue(), ^{
		if (trayDel != nil) {
			[[NSStatusBar systemStatusBar] removeStatusItem:trayDel.statusItem];
			trayDel = nil;
		}
	});
}
