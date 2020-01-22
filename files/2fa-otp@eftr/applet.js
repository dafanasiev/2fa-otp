const Applet = imports.ui.applet;
const PopupMenu = imports.ui.popupMenu;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Lang = imports.lang;

const jsOTP = require('./jsOTP-es5.js');

const UUID = "2fa-otp@eftr";
const APPLET_PATH = imports.ui.appletManager.appletMeta[UUID].path;

function TwoFAOTPApplet(metadata, orientation, panel_height, instance_id) {
	this._init(metadata, orientation, panel_height, instance_id);
}

TwoFAOTPApplet.prototype = {
	__proto__: Applet.IconApplet.prototype,

	_init: function (metadata, orientation, panel_height, instance_id) {
		//global.log("-------------------------");

		try {
			Applet.IconApplet.prototype._init.call(this, orientation, panel_height, instance_id);
			this.set_applet_icon_path(APPLET_PATH + "/icons/app.svg");
			this.set_applet_tooltip(_("2FA OTP"));

			this.menuManager = new PopupMenu.PopupMenuManager(this);
			this.menu = new Applet.AppletPopupMenu(this, orientation);
			this.menuManager.addMenu(this.menu);
		} catch (e) {
			global.log(e);
		}
	},

	updateMenu: function () {
		//global.log('update....');
		try {
			this.menu.removeAll();

			const file = Gio.file_new_for_path(GLib.get_home_dir() + '/.2fa-otp');

			if (!file.query_exists(null)) {
				file.create(Gio.FileCreateFlags.NONE, null);
				file.replace_contents('[]', null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null);
			}

			let success, configString, tag;
			[success, configString, tag] = file.load_contents(null);
			if (success) {
				const config = JSON.parse(configString);
				for (let i = 0; i < config.length; i++) {
					const configItem = config[i];
					let mi = new PopupMenu.PopupMenuItem(configItem.name);
					mi.connect('activate', Lang.bind(this, function (event) {
						try {
							let code;
							switch (configItem.type) {
								case 'totp':
									{
										const otp = new jsOTP.totp();
										code = otp.getOtp(configItem.secret);
									}
									break;

								case 'hotp':
									{
										const otp = new jsOTP.hotp();
										configItem.counter = configItem.counter || 0;
										++configItem.counter;

										code = otp.getOtp(configItem.secret, configItem.counter);

										configString = JSON.stringify(config);
										file.replace_contents(configString, null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null);
									}
									break;
								default:
									throw new Error('Invalid type in config. Support only [totp, hotp]');
							}

							if (code.length == 6) {
								code = code.substring(0, 3) + ' ' + code.substring(3);
							}

							GLib.spawn_command_line_async(`notify-send -u critical -i network '${code}'`);
						} catch (e) {
							global.log(e);
						}
					}));
					this.menu.addMenuItem(mi);
				}
			}
		} catch (e) {
			global.log(e);
		}

	},

	on_applet_clicked: function (event) {
		this.updateMenu();
		this.menu.toggle();
	},

	on_applet_removed_from_panel: function () {
	}
};

function main(metadata, orientation, panel_height, instance_id) {
	return new TwoFAOTPApplet(metadata, orientation, panel_height, instance_id);
}
