// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: clipboard-list;
const codeUrl = "https://raw.githubusercontent.com/P-man2976/Scriptable/master/Timetable-widget.js";

const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSctyuB2Qr_RSSG-T5qR4Rc897-VIPMWmDzeMl_fFXeKHBp6yA/viewform?usp=sf_link";

const widgetSize = config.widgetFamily;

let fm = FileManager.local();
const iCloudInUse = fm.isFileStoredIniCloud(module.filename);
fm = iCloudInUse ? FileManager.iCloud() : fm;

const fileName = fm.fileName(module.filename);

// 設定保存用ディレクトリ
const settingsDirectory = fm.joinPath(fm.libraryDirectory(), "TimetableAPI");

// 設定保存用ディレクトリが存在しない場合、作成
if (!fm.fileExists(settingsDirectory)) {
	fm.createDirectory(settingsDirectory);
	console.log(`Created settings directory: ${fm.fileExists(settingsDirectory)}`);
}

// 設定ファイルが存在しない場合、作成
if (!fm.fileExists(fm.joinPath(settingsDirectory, "settings.json"))) {
	
	const defaultSettings = {
		meta: {
			type: "general",
			version: 0.1
		},
		general: {
			grade: null,
			class: null
		},
		preference: {
			theme: "flex"
		},
		notification: {
			isEnabled: false,
			schedule: []
		}
	}
	
	fm.writeString(fm.joinPath(settingsDirectory, "settings.json"), JSON.stringify(defaultSettings));
	console.log(`Created default settings: ${fm.fileExists(fm.joinPath(settingsDirectory, "settings.json"))}`);
}

if (!fm.fileExists(fm.joinPath(settingsDirectory, "theme-default.json"))) {
	
	const defaultThemeSettings = {
		meta: {
			type: "theme",
			name: "default",
			version: 0.1
		},
		inClass: {
			next: {
				backgroundColor: null,
				borderColor: null,
				borderWidth: null,
				cornerRadius: null,
				textColor: null
			},
			future: {
				backgroundColor: null,
				borderColor: null,
				borderWidth: null,
				cornerRadius: null,
				textColor: null
			},
			clock: {
				backgroundColor: null,
				borderColor: null,
				borderWidth: null,
				cornerRadius: null,
				textColor: null
			}
		},
		afterSchool: {
			tomorrow: {
				backgroundColor: null,
				borderColor: null,
				borderWidth: null,
				cornerRadius: null,
				textColor: null
			},
			info: {
				backgroundColor: null,
				borderColor: null,
				borderWidth: null,
				cornerRadius: null,
				textColor: null
			},
			clock: {
				backgroundColor: null,
				borderColor: null,
				borderWidth: null,
				cornerRadius: null,
				textColor: null
			}
		}
	}
	const flexThemeSettings = {
		meta: {
			type: "theme",
			name: "flex",
			version: 0.1
		},
		inClass: {
			accentColor: null,
		},
		afterSchool: {
			accentColor: null
		}
	}
	fm.writeString(fm.joinPath(settingsDirectory, "theme-default.json"), JSON.stringify(defaultThemeSettings));
	fm.writeString(fm.joinPath(settingsDirectory, "theme-flex.json"), JSON.stringify(flexThemeSettings));
	console.log(`Created default theme setting: ${fm.joinPath(settingsDirectory, "theme-default.json")}`);
	console.log(`Created flex theme setting: ${fm.joinPath(settingsDirectory, "theme-flex.json")}`);
}

// 設定ファイル読み込み
const generalSettings = JSON.parse(fm.readString(fm.joinPath(settingsDirectory, "settings.json")));
const defaultThemeSettings = JSON.parse(fm.readString(fm.joinPath(settingsDirectory, "theme-default.json")));
const flexThemeSettings = JSON.parse(fm.readString(fm.joinPath(settingsDirectory, "theme-flex.json")));

// デバッグ用：各設定ファイル削除
// fm.remove(fm.joinPath(settingsDirectory, "settings.json"));
// fm.remove(fm.joinPath(settingsDirectory, "theme-default.json"));
// fm.remove(fm.joinPath(settingsDirectory, "theme-flex.json"));.

// 設定保存関数
async function saveSettings (settings) {
	let filepath;
	try {
		switch (settings.meta.type) {
			case "general":
				filePath = fm.joinPath(settingsDirectory, "settings.json")
				fm.writeString(filePath, JSON.stringify(settings));
				console.log(`Saved general settings to ${filePath}`);
				break;
			case "theme":
				filePath = fm.joinPath(settingsDirectory, `theme-${settings.meta.name}.json`);
				fm.writeString(filePath, JSON.stringify(settings));
				console.log(`Saved theme settings to ${filePath}`);
				break;
			default:
				return false;
		}
		return true;
	} catch (error) {
		console.error(error);
		return false;
	}
}

async function downloadCode(filename, url) {
	try {
		
		const codeString = await new Request(url).loadString();

		console.log(codeString);
		if (codeString.indexOf("// Variables used by Scriptable.") < 0) {
			return false;
		} else {
			fm.writeString(
				fm.joinPath(
					fm.documentsDirectory(),
					filename + ".js"
				),
				codeString
			);
			return true;
		}
	} catch(error) {
		console.error(error)
		return false;
	}
}

async function generateAlert(title, message, options, textvals, placeholders) {
	const alert = new Alert();
	alert.title = title;
	if (message) alert.message = message;

		const buttons = options || ["OK"];
	for (button of buttons) {
		alert.addAction(button);
	}

	if (!textvals) {
		return await alert.presentAlert();
	}

	for (i = 0; i < textvals.length; i++) {
		alert.addTextField(
			placeholders && placeholders[i] ? placeholders[i] : null,
			(textvals[i] || "") + ""
		);
	}

	if (!options) await alert.present();
	return alert;
}

async function generateUiTable(title, subtitle, options, height, showSeparators = true) {
	
	try {
	const ui = new UITable();
	ui.showSeparators = showSeparators;

	const uiTitle = new UITableRow();
	uiTitle.height = 80;

	uiHeader = UITableCell.text(title, subtitle);
	uiHeader.titleFont = Font.boldSystemFont(30);

	uiTitle.addCell(uiHeader);
	ui.addRow(uiTitle);

	for (option of options) {
		const uiOption = new UITableRow();
		uiOption.height = height;
		uiOption.dismissOnSelect = false;
		uiOption.onSelect = option.onSelect;
		
		
		
		// 項目
		uiText = UITableCell.text(option.title, option.description);
		uiText.titleFont = Font.body();
		uiText.subtitleFont = Font.caption1();
		uiText.subtitleColor = Color.gray();
		uiText.widthWeight = 50;
		uiOption.addCell(uiText);
		
		if (option.currentValue) {
			// 現在値
			let uiCurrent;
			if (typeof option.currentValue === "function") {
				uiCurrent = UITableCell.text(await option.currentValue());
			} else {
				uiCurrent = UITableCell.text(option.currentValue);
			}
			uiCurrent.titleFont = Font.body();
			uiCurrent.titleColor = Color.gray();
			uiCurrent.widthWeight = 47;
			uiCurrent.rightAligned();
			uiOption.addCell(uiCurrent);
		} else if (option.image) {
			// 現在値（画像）
			uiImage = UITableCell.image();
			uiOption.addCell(uiImage);
		}

		// ">"ボタン
		uiArrow = UITableCell.text("›");
		uiArrow.titleFont = Font.regularRoundedSystemFont(26);
		uiArrow.titleColor = Color.darkGray();
		uiArrow.widthWeight = 3;
		uiArrow.rightAligned();
		uiOption.addCell(uiArrow);
		
		ui.addRow(uiOption);
	}

	await ui.present(false);
	return;
	
	} catch(error) {
		console.error(error);
		return;
	}
}

async function fetchAPI(endpoint, reqGrade, reqClass) {
	
	try {
		if(Keychain.contains("TIMETABLE_API_KEY")) {
			const req = new Request(encodeURI(`https://pman2976.f5.si:19302${endpoint}?grade=${reqGrade}&class=${reqClass}&key=${Keychain.get("TIMETABLE_API_KEY")}`));
			req.timeoutInterval = 5;
			return await req.loadString();
		} else {
			throw "API Key error";
		}
		
	} catch(error) {
		throw error;
	}	
}

async function fetchAPIKey(email, name) {
	try {
		const req = new Request(encodeURI(`https://pman2976.f5.si:19302/api/timetable/v1.1/key?email=${email}&name=${name}`));
		req.timeoutInterval = 5;
		return await req.loadString();
	} catch(error) {
		throw error;
	}
}

// NOTE: This script was written by evandcoleman: https://github.com/evandcoleman/scriptable
// Modified by P_man2976

class Cache {
	constructor(cacheLocation, name) {
        if (cacheLocation == "iCloud") {
            this.fm = FileManager.iCloud();
            this.cachePath = this.fm.joinPath(this.fm.libraryDirectory(), name);
        } else if (cacheLocation == "local") {
            this.fm = FileManager.local();
            this.cachePath = this.fm.joinPath(this.fm.libraryDirectory(), name);
        } else {
            throw "cache location must either be 'iCloud' or 'local'";
        }

        if (!this.fm.fileExists(this.cachePath)) {
            this.fm.createDirectory(this.cachePath);
        }
    }
	async read(key, tostring = true, expirationMinutes) {
		try {
			const path = this.fm.joinPath(this.cachePath, key);
			const createdAt = this.fm.creationDate(path);
			if (!this.fm.fileExists(path)) return null;

			if (expirationMinutes) {
				if (new Date() - createdAt > expirationMinutes * 60000) {
					this.fm.remove(path);
					return null;
				}
			}

			const value = this.fm.readString(path);
			
			if (toString) {
				try {
					return JSON.parse(value).toString();
				} catch (error) {
					return value.toString();
				}
			} else {
				try {
					return JSON.parse(value);
				} catch (error) {
					return value;
				}
			}
			
			
		} catch (error) {
			return null;
		}
	}
	write(key, value) {
		const path = this.fm.joinPath(this.cachePath, key.replace("/", "-"));
		console.log(`Caching to ${path}...`);

		if (typeof value === "string" || value instanceof String) {
			this.fm.writeString(path, value);
		} else {
			this.fm.writeString(path, JSON.stringify(value));
		}
	}
	exists(key) {
		const path = this.fm.joinPath(this.cachePath, key.replace("/", "-"));
		
		if (this.fm.fileExists(path)) {
			if (this.fm.readString(path)) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	}
	mkdir(key) {
		const path = this.fm.joinPath(this.cachePath, key.replace("/", "-"));
		console.log(`Making directory [${key}]`);
		
		if (typeof key === "string") {
			this.fm.createDirectory(key);
		} else {
			throw "";
		}
	}
}

const cache = new Cache("local", "timetable-cache");

//#########################################################################

const html = `
<!doctypehtml><style>body{background-color:#181818;color:#fff;font-family:sans-serif;font-weight:100;text-align:center;margin:0;padding:0}table{margin:auto;white-space:nowrap;border-width:1px;border-collapse:collapse}td{white-space:nowrap}hr{width:100%;height:1px;border:0;background-color:#444}#control_panel{display:flex;flex-direction:column;margin:0 20px 40px 20px;border-radius:24px;padding:10px;background-color:#242424;box-shadow:0 0 10px 10px rgba(18,18,18,100);align-items:center;justify-content:center}#control{display:flex;align-items:center;justify-content:space-around;width:100%}#status{display:flex;align-items:center;flex-direction:row-reverse}#playground{padding:20px;overflow:auto}input{background-color:#444;color:#fff;text-align:center;font-size:1.5rem;font-weight:200;border-width:0;border-radius:8px;padding:4px 2px;width:4rem}button{background-color:#e61b62;font-size:16px;color:#fff;border-width:0;border-radius:8px;height:2rem;max-height:6vh;width:100%}.settings{display:flex;flex-direction:column;margin:4px}.note{font-size:12px;color:#aaa}#p{font-size:20px;margin:15px 0}</style><h1>マインスイーパー</h1><p>空き時間の暇つぶしに。<div id=control_panel><div id=control><div id=width class=settings><span>幅</span> <input id=W min=8 required type=number value=9 max=70> <span class=note>8~70</span></div><div id=height class=settings><span>高さ</span> <input id=H min=8 required type=number value=9 max=25> <span class=note>8~25</span></div><div id=level class=settings><span>レベル</span> <input id=M min=9 required type=number value=9> <span class=note>9~</span></div></div><hr><button onclick=S()>スタート</button><p id=p></div><div id=playground><table id=t></table></div><script>window.onload = S = function () {
					if (R(W)) W.value = 9;
					if (R(H)) H.value = 9;
					M.max = ((w = W.value) - 1) * ((h = H.value) - 1);
					if (R(M)) M.value = 10;
					m = f = z = M.value;
					s = performance.now();
					T();
					for (i = t.rows.length; i-- > 0; t.deleteRow(0));
					a = new Array(h);
					for (i = h; i-- > 0; ) {
						a[i] = new Array(w);
						r = t.insertRow(0);
						for (j = w; j-- > 0; ) {
							d = r.insertCell((o = a[i][j] = 0));
							[d.w, d.h, d.style] = [
								j,
								i,
								"white-space:nowrap;min-width:5vw;height:5vw;border:solid;border-width:1px;text-align:center;font-size:3vw;cursor:default",
							];
							d.onclick = function () {
								if (!V() || this[v].match("[#-8]")) return;
								if (!o)
									do
										if (
											a[(y = (Math.random() * h) | 0)][
												(x = (Math.random() * w) | 0)
											] < 1 &&
											(Math.abs(this.w - x) > 1 ||
												Math.abs(this.h - y) > 1) &&
											z--
										)
											a[y][x] = 1;
									while (z);
								if (!a[this.h][this.w]) N(this);
								else if ((f = "Lose"))
									for (i = h; i-- > 0; )
										for (j = w; j-- > 0; )
											if (a[i][j])
												t.rows[i].cells[j][v] = "※";
							};
							d.oncontextmenu = function () {
								if (V() && !this[v].match("[*-8]"))
									if (!this[v] && f-- > 0) this[v] = "#";
									else if (++f) this[v] = "";
								return !1;
							};
						}
					}
				};
				T = () =>
					(p[(v = "innerHTML")] =
						((k =
							((e = ((performance.now() - s) / 1e3) | 0) / 60) |
							0) < 10
							? "0"
							: "") +
						k +
						((l = e % 60) < 10 ? ":0" : ":") +
						l +
						(+f >= f ? " #" : " ") +
						f) && V()
						? setTimeout(T)
						: 0;
				V = () => +f >= f;
				R = (r) => !r.reportValidity();
				function N(c) {
					if (!c || c[v].match("[*-8]")) return;
					c.style.background = "#555";
					if (~c[v].indexOf("#") && f++) T();
					if (
						!(c[v] =
							(a[(y = c.h)][(x = c.w) - 1] > 0) +
							(a[y][x + 1] > 0) +
							(y > 0 && a[y - 1][x - 1] > 0) +
							(y > 0 && a[y - 1][x] > 0) +
							(y > 0 && a[y - 1][x + 1] > 0) +
							(y < h - 1 && a[y + 1][x - 1] > 0) +
							(y < h - 1 && a[y + 1][x] > 0) +
							(y < h - 1 && a[y + 1][x + 1] > 0)) &&
						(c[v] = "-")
					)
						for (c.i = 9; c.i-- > 0; )
							if (c.i != 4)
								N(
									((X = c.w + 1 - ((c.i / 3) | 0)) >= 0) *
										((Y = c.h + 1 - (c.i % 3)) >= 0) *
										(X < w) *
										(Y < h) >
										0
										? t.rows[Y].cells[X]
										: 0
								);
					if (++o >= w * h - m) f = "Win";
				}</script>
`;

let eEC = 0;

//#########################################################################

async function createSmallWidget(refreshInterval) {
	
	try {
		
		const timetable = JSON.parse(await fetchAPI("/api/timetable/v1.1/now", await cache.read("timetableapi-grade"), await cache.read("timetableapi-class")));
		const widget = new ListWidget();
		widget.backgroundColor = Color.dynamic(Color.white(), new Color("#121212"));
		
		console.log(JSON.stringify(timetable, null, "\t"));
		
		switch (timetable.status) {
			case "Unauthorized":
				
				throw "Unauthorized";
			case "API Key error":
				
				throw "API Key error";
			case "Server error":
			
				throw "Server error";
			case "Bad request":
				
				throw "Request error";
			case "Not found":
			
				throw "Not found";
			default:
				break;
		}
		
		if (timetable.period !== -2) {
			const refreshDate = Date.now() + 1000*60*refreshInterval;
			widget.refreshAfterDate = new Date(refreshDate);
			widget.spacing = 4;
			widget.useDefaultPadding();
				
			// 上段、下段スタックの定義
			const titleStack = widget.addStack();
			const infoStack = widget.addStack();
			
			titleStack.cornerRadius = 8;
			titleStack.borderColor = Color.dynamic(
				new Color(defaultThemeSettings.inClass.next.borderColor || "#000"),
				new Color(defaultThemeSettings.inClass.next.borderColor || "#FFF")
			);
			titleStack.borderWidth = defaultThemeSettings.inClass.next.borderWidth || 2;
			titleStack.size = new Size(140, 60);
			titleStack.layoutVertically();
			
			infoStack.spacing = 4;
			infoStack.cornerRadius = 8;
			infoStack.borderColor = Color.white();
			infoStack.borderWidth = 0;
			infoStack.size = new Size(140,60);
			
			// 上段のブロック（次の授業）
			// 次は
			const prefixStack = titleStack.addStack();
			prefixStack.cornerRadius = 8;
			prefixStack.borderColor = Color.white();
			prefixStack.borderWidth = 0;
			prefixStack.size = new Size(140,20);
			prefixStack.bottomAlignContent();
			
			const prefix = prefixStack.addText("次は");
			prefix.font = Font.boldSystemFont(12);
			prefix.textColor = Color.dynamic (
				new Color(defaultThemeSettings.inClass.next.textColor || "#000"),
				new Color(defaultThemeSettings.inClass.next.textColor || "#FFF")
			);
			
			const prefixSpacer = prefixStack.addSpacer(100)
			
			//教科名
			const subjectStack = titleStack.addStack();
			subjectStack.cornerRadius = 8;
			subjectStack.borderColor = Color.white();
			subjectStack.borderWidth = 0;
			subjectStack.size = new Size(140,40);
			subjectStack.centerAlignContent();
			
			const subject = subjectStack.addText("");
			subject.font = Font.boldSystemFont(20);
			subject.textColor = Color.dynamic (
				new Color(defaultThemeSettings.inClass.next.textColor || "#000"),
				new Color(defaultThemeSettings.inClass.next.textColor || "#FFF")
			);
			if (timetable.next[0]) {
				subject.text = timetable.next[0].name;
			} else {
				subject.text = "-";
			}
			
			subject.centerAlignText()
			
			// 下段のブロック（さらに後の授業、時刻）
			const futureStack = infoStack.addStack();
			const timeStack = infoStack.addStack();
			
			futureStack.cornerRadius = 8;
			futureStack.borderColor = Color.dynamic(
				new Color(defaultThemeSettings.inClass.future.borderColor || "#000"),
				new Color(defaultThemeSettings.inClass.future.borderColor || "#FFF")
			);
			futureStack.borderWidth = defaultThemeSettings.inClass.future.borderWidth || 2;
			futureStack.size = new Size(73,60);
			futureStack.layoutVertically();
			
			timeStack.cornerRadius = 8;
			timeStack.borderColor = Color.dynamic(
				new Color(defaultThemeSettings.inClass.clock.borderColor || "#000"),
				new Color(defaultThemeSettings.inClass.clock.borderColor || "#FFF")
			);
			timeStack.borderWidth = defaultThemeSettings.inClass.clock.borderWidth || 2;
			timeStack.size = new Size(63,60);
			timeStack.centerAlignContent();
			timeStack.layoutVertically();
			
			// さらに後
			const futurePrefixStack = futureStack.addStack();
			futurePrefixStack.cornerRadius = 0;
			futurePrefixStack.borderColor = Color.white();
			futurePrefixStack.borderWidth = 0;
			futurePrefixStack.size = new Size(73,15);
			futurePrefixStack.bottomAlignContent();
			
			const futurePrefix = futurePrefixStack.addText("さらに後");
			const futurePrefixSpacer = futurePrefixStack.addSpacer(23);
			futurePrefix.font = Font.boldSystemFont(9);
			futurePrefix.textColor = Color.dynamic (
				new Color(defaultThemeSettings.inClass.future.textColor || "#000"),
				new Color(defaultThemeSettings.inClass.future.textColor || "#FFF")
			)
		
			// さらに後の教科
			const futureSubjectStack = futureStack.addStack();
			futureSubjectStack.cornerRadius = 0;
			futureSubjectStack.borderColor = Color.white();
			futureSubjectStack.borderWidth = 0;
			futureSubjectStack.size = new Size(73,45);
			futureSubjectStack.centerAlignContent();
			futureSubjectStack.layoutVertically();
			futureSubjectStack.setPadding(0,8,0,0)
		
			const futureSubjectFirst = futureSubjectStack.addText("");
			const futureSubjectSecond = futureSubjectStack.addText("");
			futureSubjectFirst.font = Font.boldSystemFont(13);
			futureSubjectFirst.textColor = Color.dynamic (
				new Color(defaultThemeSettings.inClass.future.textColor || "#000"),
				new Color(defaultThemeSettings.inClass.future.textColor || "#FFF")
			);
			futureSubjectSecond.font = Font.boldSystemFont(13);
			futureSubjectSecond.textColor = Color.dynamic (
				new Color(defaultThemeSettings.inClass.future.textColor || "#000"),
				new Color(defaultThemeSettings.inClass.future.textColor || "#FFF")
			)
			
			if (timetable.next[1]) {
				futureSubjectFirst.text = timetable.next[1].name;
			} else {
				futureSubjectFirst.text = "-";
			}
			if (timetable.next[2]) {
				futureSubjectSecond.text = timetable.next[2].name;
			} else {
				futureSubjectSecond.text = "-";
			}
			
			// 時刻
			const dayArray = ["日", "月", "火", "水", "木", "金", "土"];
			
			const currentTime = new Date();
			const currentMonth = ("0" + (currentTime.getMonth() + 1)).slice(-2);
			const currentDate = ("0" + currentTime.getDate()).slice(-2);
			const dayString = dayArray[currentTime.getDay()];
			const dateString = `${currentMonth}/${currentDate} `;
			
			const currentTimeStack = timeStack.addStack();
			currentTimeStack.cornerRadius = 0;
			currentTimeStack.borderColor = Color.white();
			currentTimeStack.borderWidth = 0;
			currentTimeStack.size = new Size(63,20);
			currentTimeStack.centerAlignContent();
			
			const currentDateStack = timeStack.addStack();
			currentDateStack.cornerRadius = 0;
			currentDateStack.borderColor = Color.white();
			currentDateStack.borderWidth = 0;
			currentDateStack.size = new Size(63,15);
			currentDateStack.centerAlignContent();
			
			const currentWeekStack = timeStack.addStack();
			currentWeekStack.cornerRadius = 0;
			currentWeekStack.borderColor = Color.white();
			currentWeekStack.borderWidth = 0;
			currentWeekStack.size = new Size(63,10);
			currentWeekStack.centerAlignContent();
			
			const time = currentTimeStack.addDate(currentTime);
			time.font = new Font("DIN Alternate", 20);
			time.textColor = Color.dynamic (
				new Color(defaultThemeSettings.inClass.clock.textColor || "#000"),
				new Color(defaultThemeSettings.inClass.clock.textColor || "#FFF")
			);
			time.applyTimeStyle();
			
			const date = currentDateStack.addText(dateString);
			date.font = new Font("DIN Alternate", 12);
			date.textColor = Color.dynamic (
				new Color(defaultThemeSettings.inClass.clock.textColor || "#000"),
				new Color(defaultThemeSettings.inClass.clock.textColor || "#FFF")
			);
			
			const currentDateSpacer = currentDateStack.addSpacer(1);
			
			const day = currentDateStack.addText(dayString);
			day.font = Font.boldSystemFont(12);
			day.textColor = Color.dynamic (
				new Color(defaultThemeSettings.inClass.clock.textColor || "#000"),
				new Color(defaultThemeSettings.inClass.clock.textColor || "#FFF")
			);
			
			const week = currentWeekStack.addText(timetable.week);
			week.font = new Font("DIN Alternate", 10);
			week.textColor = Color.dynamic (
				new Color(defaultThemeSettings.inClass.clock.textColor || "#000"),
				new Color(defaultThemeSettings.inClass.clock.textColor || "#FFF")
			);
		
			const currentWeekSpacer = currentWeekStack.addSpacer(2);
		
			const suffix = currentWeekStack.addText("週");
			suffix.font = Font.boldSystemFont(10);
			suffix.textColor = Color.dynamic (
				new Color(defaultThemeSettings.inClass.clock.textColor || "#000"),
				new Color(defaultThemeSettings.inClass.clock.textColor || "#FFF")
			);
			
			await widget.presentSmall();
			return widget;
		} else {
			
			// 親スタック
			const stack = widget.addStack();
			stack.cornerRadius = 8;
			stack.borderColor = Color.white();
			stack.borderWidth = 2;
			stack.size = new Size(140, 120);
			stack.centerAlignContent();
			stack.spacing = 4;
			
			// 明日の授業を表示するブロック
			const tomorrowStack = stack.addStack();
			tomorrowStack.cornerRadius = 8;
			tomorrowStack.borderColor = Color.dynamic(
				new Color(defaultThemeSettings.afterSchool.tomorrow.borderColor || "#000"),
				new Color(defaultThemeSettings.afterSchool.tomorrow.borderColor || "#FFF")
			);
			tomorrowStack.borderWidth = defaultThemeSettings.afterSchool.tomorrow.borderWidth || 2;
			tomorrowStack.size = new Size(68, 120);
			tomorrowStack.spacing = 2;
			tomorrowStack.setPadding(0, 8, 0, 0)
			tomorrowStack.centerAlignContent();
			tomorrowStack.layoutVertically();
			
			// 明日の授業
			const title = tomorrowStack.addText("明日の授業");
			title.font = Font.boldSystemFont(8);
			title.textColor = Color.dynamic (
				new Color(defaultThemeSettings.afterSchool.tomorrow.textColor || "#000"),
				new Color(defaultThemeSettings.afterSchool.tomorrow.textColor || "#FFF")
			);
			title.leftAlignText();
			
			const tomorrowSubjectStack = tomorrowStack.addStack();
			tomorrowSubjectStack.layoutVertically();
			// 明日の教科をforEachで順番に追加
			let tomorrowSubject = [];
			if (timetable.next[0]) {
				timetable.next.forEach((subject, index) => {
					if (subject.name === "掃除" || subject.name === "昼食") return;
					tomorrowSubject[index] = tomorrowSubjectStack.addText(subject.name);
					tomorrowSubject[index].font = Font.boldSystemFont(12);
					tomorrowSubject[index].textColor = Color.dynamic (
						new Color(defaultThemeSettings.afterSchool.tomorrow.textColor || "#000"),
						new Color(defaultThemeSettings.afterSchool.tomorrow.textColor || "#FFF")
					)
					tomorrowSubject[index].centerAlignText();
				});
			}
			
			const rightStackBlock = stack.addStack();
			rightStackBlock.size = new Size(68, 120);
			rightStackBlock.layoutVertically();
			rightStackBlock.spacing = 4;
			
			const infoStack = rightStackBlock.addStack();
			infoStack.cornerRadius = 8;
			infoStack.borderColor = Color.dynamic(
				new Color(defaultThemeSettings.afterSchool.clock.borderColor || "#000"),
				new Color(defaultThemeSettings.afterSchool.clock.borderColor || "#FFF")
			);
			infoStack.borderWidth = defaultThemeSettings.afterSchool.info.borderWidth || 2;
			infoStack.size = new Size(68, 48);
			infoStack.centerAlignContent();
			infoStack.layoutVertically();
			
			let batteryImage;
			let batteryInfo;
			
			const batteryImageStack = infoStack.addStack();
			batteryImageStack.size = new Size(68, 18);
			batteryImageStack.centerAlignContent();
			const batteryLevelStack = infoStack.addStack();
			batteryLevelStack.size = new Size(68, 18);
			batteryLevelStack.centerAlignContent();
			
			if (!Device.isCharging) {
				batteryImage = SFSymbol.named('battery.100.bolt').image;
			} else {
				const battery = Device.batteryLevel();
				if (0 <= battery && battery <= 25){
					batteryImage = SFSymbol.named('battery.25').image;
				} else if (26 <= battery && battery <= 50) {
					batteryImage = SFSymbol.named('battery.50').image;
				} else if (51 <= battery && battery <= 75) {
					batteryImage = SFSymbol.named('battery.75').image;
				} else if (76 <= battery && battery <= 100) {
					batteryImage = SFSymbol.named('battery.100').image;
				}
			}
			batteryInfo = batteryImageStack.addImage(batteryImage);
			batteryInfo.tintColor = Color.white();
			batteryInfo.imageSize = new Size(36, 36);
			batteryInfo.centerAlignImage();
			
			const batteryLevel = Math.round(Device.batteryLevel() * 10000) / 100;
			
			const batteryLevelText = batteryLevelStack.addText(`${batteryLevel}%`);
			batteryLevelText.centerAlignText();
			batteryLevelText.font = Font.systemFont(12);
			
			
			// 時計ブロック
			const timeStack = rightStackBlock.addStack();
			timeStack.cornerRadius = 8;
			timeStack.borderColor = Color.dynamic(
				new Color(defaultThemeSettings.afterSchool.clock.borderColor || "#000"),
				new Color(defaultThemeSettings.afterSchool.clock.borderColor || "#FFF")
			);
			timeStack.borderWidth = defaultThemeSettings.afterSchool.clock.borderWidth || 2;
			timeStack.size = new Size(68, 68);
			
			await widget.presentSmall();
			return widget;
		}
		
	} catch(error) {
		
		console.error(error)
		
		let alertTitle;
		let alertDescription;
		
		switch (error) {
			case "Unauthorized":
				alertTitle = "API認証エラー";
				alertDescription = "このウィジェットを利用するにはAPIの認証が必要です。「初期設定」からAPIの利用登録をしてください。";
				break;
			case "API Key error":
				alertTitle = "APIキーエラー";
				alertDescription = "登録されているAPIキーが無効または間違っています。「初期設定」より再度利用登録をしてください。";
				break;
			case "Server error":
				alertTitle = "APIサーバーエラー";
				alertDescription = "APIサーバーでエラーが発生しました。時間を置いて再度お試しください。";
				break;
			case "Request error":
				alertTitle = "APIリクエストエラー";
				alertDescription = "APIサーバーへのリクエストでエラーが発生しました。「初期設定」から学年・クラスを正しい値に設定してください。";
				break;
			case "Not found":
				alertTitle = "APIリクエストエラー";
				alertDescription = "APIサーバーに該当クラスの時間割データが存在しません。「サポート」→「時間割の追加依頼」で時間割を提供していただけると、データを受け取ることができるようになります。";
				break;
			default:
				alertTitle = "エラー";
				alertDescription = error.toString();
				
				const widget = new ListWidget();
				widget.backgroundColor = new Color("#121212");
				widget.setPadding(16, 16, 16, 16);
				
				const refreshDate = Date.now() + 1000*60*refreshInterval;
				widget.refreshAfterDate = new Date(refreshDate);
				
				const sfSymbol = SFSymbol.named("icloud.slash");
				
				const offlineSymbol = widget.addImage(sfSymbol.image);
				offlineSymbol.resizable = true;
				offlineSymbol.imageSize = new Size(40, 40);
				offlineSymbol.tintColor = Color.white();
				offlineSymbol.imageOpacity = 0.6;
				offlineSymbol.centerAlignImage();
				
				widget.addSpacer(5);
				
				const offline = widget.addText("オフライン");
				offline.textOpacity = 0.6;
				offline.font = Font.boldSystemFont(14);
				offline.centerAlignText();
				
				widget.addSpacer(5);
				
				const dateString = new DateFormatter();
				
				const date = widget.addText()
				
				await widget.presentSmall();
				
				return widget;
				
				break;
		}
		await generateAlert(alertTitle, alertDescription);
		
		throw error;
	}
}

//#########################################################################

async function createNewSmallWidget(refreshInterval) {
	
	try {
		
		const startTime = ['8:45~', '9:50~', '10:55~', '12:00~', '13:40~', '14:45~', '15:45~', '放課後'];
		
		const timetable = JSON.parse(await fetchAPI("/api/timetable/v1.1/now", generalSettings.general.grade, generalSettings.general.class));
		const widget = new ListWidget();
		widget.backgroundColor = Color.dynamic(Color.white(), new Color("#121212"));
		widget.setPadding(16, 16, 16, 16);
		
		const refreshDate = Date.now() + 1000*60*refreshInterval;
		widget.refreshAfterDate = new Date(refreshDate);
		
		const currentDate = new DateFormatter();
		currentDate.locale = "ja";
		currentDate.dateFormat = "MMMd日（E）H:mm";
		
		
		console.log(JSON.stringify(timetable, null, "\t"));
		
		switch (timetable.status) {
			case "Unauthorized":
				
				throw "Unauthorized";
			case "API Key error":
				
				throw "API Key error";
			case "Server error":
			
				throw "Server error";
			case "Bad request":
				
				throw "Request error";
			case "Not found":
			
				throw "Not found";
			default:
				break;
		}
		
		if (timetable.period !== -2) {
			
			nextStack = widget.addStack();
			nextStack.size = new Size(120, 120);
			nextStack.borderWidth = 0;
			nextStack.borderColor = Color.white();
			nextStack.layoutVertically();
			
			// タイトルのブロック
			const titleStack = nextStack.addStack();
			titleStack.borderColor = Color.white();
			titleStack.borderWidth = 0;
			titleStack.size = new Size(120, 35);
			
			// アクセントカラー
			const accent = titleStack.addStack();
			accent.backgroundColor = Color.dynamic(
				new Color(flexThemeSettings.inClass.accentColor || "#0A84FF"),
				new Color(flexThemeSettings.inClass.accentColor || "#0A84FF")
			);
			accent.borderColor = Color.blue();
			accent.size = new Size(5, 35);
			accent.cornerRadius = 2;
			
			
			titleStack.addSpacer(5);
			
			// タイトル、サブタイトルを格納するスタック
			const title = titleStack.addStack();
			title.size = new Size(110, 35);
			title.borderColor = Color.white();
			title.borderWidth = 0;
			title.layoutVertically();
			
			const subTitleText = title.addText(currentDate.string(new Date()));
			subTitleText.font = Font.systemFont(10);
			
			const titleText = title.addText(`${timetable.week}週 ${timetable.period}時間目`);
			titleText.font = Font.boldSystemFont(16);
			
			nextStack.addSpacer(5);
			
			// 次の授業を表示するスタック
			const nextClassStack = nextStack.addStack();
			nextClassStack.size = new Size(120, 75);
			nextClassStack.borderWidth = 0;
			nextClassStack.borderColor = Color.white();
			nextClassStack.layoutVertically();
			
			// 次の授業の情報を格納するスタックを格納する配列
			let nextClass = [];
			let nextClassTime = [];
			let nextClassStart = [];
			let nextClassPlace = [];
			let nextClassSubject = [];
			
			// 次の授業(1つめ)の情報を表示するスタック
			nextClass[0] = nextClassStack.addStack();
			nextClass[0].size = new Size(120, 35);
			nextClass[0].borderWidth = 0;
			nextClass[0].borderColor = Color.white();
			nextClass[0].layoutVertically();
			
			// 次の授業(1つめ)の開始時間と場所を表示するスタック
			nextClassTime[0] = nextClass[0].addStack();
			nextClassTime[0].size = new Size(120, 15);
			nextClassTime[0].borderWidth = 0;
			nextClassTime[0].borderColor = Color.white();
			nextClassTime[0].bottomAlignContent();
			
			// 次の授業(1つめ)の開始時刻
			nextClassStart[0] = nextClassTime[0].addText(startTime[timetable.period]);
			nextClassStart[0].font = Font.boldSystemFont(12);
			nextClassStart[0].textColor = Color.dynamic(Color.gray(), Color.lightGray());
			
			nextClassTime[0].addSpacer(5);
			
			// 次の授業(1つめ)の場所
			nextClassPlace[0] = nextClassTime[0].addText(timetable.next[0]?.place || "-");
			nextClassPlace[0].font = Font.systemFont(10);
			
			nextClassTime[0].addSpacer();
			
			// 次の授業(1つめ)の教科
			nextClassSubject[0] = nextClass[0].addText(timetable.next[0]?.name || "-");
			nextClassSubject[0].font = Font.boldSystemFont(18);
			
			nextClassStack.addSpacer(5);
			
			// 次の授業(2つめ)の情報を表示するスタック
			nextClass[1] = nextClassStack.addStack();
			nextClass[1].size = new Size(120, 35);
			nextClass[1].borderWidth = 0;
			nextClass[1].borderColor = Color.white();
			nextClass[1].layoutVertically();
			
			// 次の授業(2つめ)の開始時間と場所を表示するスタック
			nextClassTime[1] = nextClass[1].addStack();
			nextClassTime[1].size = new Size(120, 15);
			nextClassTime[1].borderWidth = 0;
			nextClassTime[1].borderColor = Color.white();
			nextClassTime[1].bottomAlignContent();
			
			// 次の授業(2つめ)の開始時刻
			nextClassStart[1] = nextClassTime[1].addText(startTime[timetable.period + 1]);
			nextClassStart[1].font = Font.boldSystemFont(12);
			nextClassStart[1].textColor = Color.dynamic(Color.gray(), Color.lightGray());
			
			nextClassTime[1].addSpacer(5);
			
			// 次の授業(2つめ)の場所
			nextClassPlace[1] = nextClassTime[1].addText(timetable.next[1]?.place || "-");
			nextClassPlace[1].font = Font.systemFont(10);
			
			nextClassTime[1].addSpacer();
			
			// 次の授業(2つめ)の教科
			nextClassSubject[1] = nextClass[1].addText(timetable.next[1]?.name || "-");
			nextClassSubject[1].font = Font.boldSystemFont(18);
			
		} else {
			
			nextStack = widget.addStack();
			nextStack.size = new Size(120, 120);
			nextStack.borderWidth = 0;
			nextStack.borderColor = Color.white();
			nextStack.layoutVertically();
			
			// タイトルのブロック
			const titleStack = nextStack.addStack();
			titleStack.borderColor = Color.white();
			titleStack.borderWidth = 0;
			titleStack.size = new Size(120, 35);
			
			// アクセントカラー
			const accent = titleStack.addStack();
			accent.backgroundColor = Color.dynamic(
				new Color(flexThemeSettings.afterSchool.accentColor || "#0A84FF"),
				new Color(flexThemeSettings.afterSchool.accentColor || "#0A84FF")
			);
			accent.size = new Size(5, 35);
			accent.cornerRadius = 2;
			
			titleStack.addSpacer(5);
			
			// タイトル、サブタイトルを格納するスタック
			const title = titleStack.addStack();
			title.size = new Size(110, 35);
			title.borderColor = Color.white();
			title.borderWidth = 0;
			title.layoutVertically();
			
			const subTitleText = title.addText(currentDate.string(new Date()));
			subTitleText.font = Font.systemFont(10);
			
			const titleText = title.addText(`${timetable.week}週 放課後`);
			titleText.font = Font.boldSystemFont(16);
			
			nextStack.addSpacer(5);
			
			// 明日の時間割を表示するスタック
			const tmrClassStack = nextStack.addStack();
			tmrClassStack.size = new Size(120, 75);
			tmrClassStack.borderWidth = 0;
			tmrClassStack.borderColor = Color.white();
			tmrClassStack.layoutVertically();
			
			// 「明日の時間割」を表示するスタック
			const tmrPrefixStack = tmrClassStack.addStack();
			tmrPrefixStack.size = new Size(120, 15);
			tmrPrefixStack.borderWidth = 0;
			tmrPrefixStack.borderColor = Color.white();
			tmrPrefixStack.centerAlignContent();
			
			const tmrPrefix = tmrPrefixStack.addText("明日の時間割");
			tmrPrefix.font = Font.systemFont(10);
			
			tmrPrefixStack.addSpacer();
			
			const tmrSubjectStack = tmrClassStack.addStack();
			tmrSubjectStack.size = new Size(120, 60);
			tmrSubjectStack.borderWidth = 0;
			tmrSubjectStack.borderColor = Color.white();
			
			let tmrSubjectBlockStack = [];
			for (let i = 0; i < 2; i++) {
				tmrSubjectBlockStack[i] = tmrSubjectStack.addStack();
				tmrSubjectBlockStack[i].size = new Size(60, 60);
				tmrSubjectBlockStack[i].borderWidth = 0;
				tmrSubjectBlockStack[i].borderColor = Color.white();
				tmrSubjectBlockStack[i].layoutVertically();
				
				let tmrSubjectBlock = [];
				for (let ii = 0; ii < 3; ii++) {
					tmrSubjectBlock[ii] = tmrSubjectBlockStack[i].addStack();
					tmrSubjectBlock[ii].size = new Size(60, 20);
					tmrSubjectBlock[ii].borderWidth = 0;
					tmrSubjectBlock[ii].borderColor = Color.white();
					tmrSubjectBlock[ii].bottomAlignContent();
					
					let tmrSubject;
					if (i === 0) {
						tmrSubject = tmrSubjectBlock[ii].addText(timetable.next[ii]?.name || "-");
					} else {
						tmrSubject = tmrSubjectBlock[ii].addText(timetable.next[ii + 3]?.name || "-");
					}
					tmrSubject.font = Font.boldSystemFont(13);
					tmrSubjectBlock[ii].addSpacer();
				}	
			}
		}
		
		await widget.presentSmall();
		
		return widget;
	} catch(error) {
		
		let alertTitle;
		let alertDescription;
		
		switch (error) {
			case "Unauthorized":
				alertTitle = "API認証エラー";
				alertDescription = "このウィジェットを利用するにはAPIの認証が必要です。「初期設定」からAPIの利用登録をしてください。";
				break;
			case "API Key error":
				alertTitle = "APIキーエラー";
				alertDescription = "登録されているAPIキーが無効または間違っています。「初期設定」より再度利用登録をしてください。";
				break;
			case "Server error":
				alertTitle = "APIサーバーエラー";
				alertDescription = "APIサーバーでエラーが発生しました。時間を置いて再度お試しください。";
				break;
			case "Request error":
				alertTitle = "APIリクエストエラー";
				alertDescription = "APIサーバーへのリクエストでエラーが発生しました。「初期設定」から学年・クラスを正しい値に設定してください。";
				break;
			case "Not found":
				alertTitle = "APIリクエストエラー";
				alertDescription = "APIサーバーに該当クラスの時間割データが存在しません。「サポート」→「時間割の追加依頼」で時間割を提供していただけると、データを受け取ることができるようになります。";
				break;
			default:
				alertTitle = "エラー";
				alertDescription = error.toString();
				
				const widget = new ListWidget();
				widget.backgroundColor = new Color("#121212");
				widget.setPadding(16, 16, 16, 16);
				
				const refreshDate = Date.now() + 1000*60*refreshInterval;
				widget.refreshAfterDate = new Date(refreshDate);
				
				const sfSymbol = SFSymbol.named("icloud.slash");
				
				const offlineSymbol = widget.addImage(sfSymbol.image);
				offlineSymbol.resizable = true;
				offlineSymbol.imageSize = new Size(40, 40);
				offlineSymbol.tintColor = Color.white();
				offlineSymbol.imageOpacity = 0.6;
				offlineSymbol.centerAlignImage();
				
				widget.addSpacer(5);
				
				const offline = widget.addText("オフライン");
				offline.textOpacity = 0.6;
				offline.font = Font.boldSystemFont(14);
				offline.centerAlignText();
				
				
				await widget.presentSmall();
				
				return widget;
				
				break;
		}
		await generateAlert(alertTitle, alertDescription);
		
		console.error(error);
		
	}
}

//#########################################################################

async function createMediumWidget() {
	const widget = new ListWidget();
	
	
	const txt = widget.addText("ごめんなさい、このサイズには対応していません🙇");
	txt.centerAlignText();
	
	return widget;
}

//#########################################################################

async function createLargeWidget() {
	const widget = new ListWidget();
	
	
	const txt = widget.addText("ごめんなさい、このサイズには対応していません🙇");
	txt.centerAlignText();
	
	return widget;
}

//#########################################################################

const initSettingOptions = [
	{
		title: "APIキー取得",
		description: "APIを利用するためのAPIキーを取得します。",
		onSelect: async function () {
			
			try {
				const alert = new Alert();
				alert.title = "資格情報の入力";
				alert.message = "APIキーを取得する際に必要な情報を入力してください。\n（この情報はAPIの不正利用防止のためのものです。）";
				alert.addTextField("学校のメールアドレス");
				alert.addTextField("名前（ニックネームでOK）");
				alert.addAction("取得");
				alert.addCancelAction("キャンセル");
			
				const selectedNumber = await alert.present();
				if (selectedNumber === -1) return;
				const res = JSON.parse(await fetchAPIKey(alert.textFieldValue(0), alert.textFieldValue(1)));
				console.log(res);
				Keychain.set("TIMETABLE_API_KEY", res.key);
				await generateAlert("キー取得完了", "APIキーの取得に成功しました。");
			} catch(error) {
				await generateAlert("キー取得失敗", `APIキーの取得に失敗しました。時間を置いて再度お試しください。\n${error}`);
			}
		}
	},
	{
		title: "APIキー確認",
		description: "使用中のAPIキーを確認します。",
		currentValue: async function () {
			return Keychain.contains("TIMETABLE_API_KEY") ? Keychain.get("TIMETABLE_API_KEY") : "未設定"
		},
		onSelect: async function () {
			let apiKey;
			if (Keychain.contains("TIMETABLE_API_KEY")) {
				apiKey = Keychain.get("TIMETABLE_API_KEY");
				generateAlert("現在使用中のAPIキー", apiKey);
			} else {
				generateAlert (
					"APIキーが見つかりませんでした",
					"APIキーが登録されていません。「APIキー取得」からAPIキーを取得してください。"
				);
			}
		}
	},
	{
		title: "APIキー削除",
		description: "APIキー情報を削除します。",
		onSelect: async function () {
			
			try {
				const options = ['キャンセル', '削除'];
				const selectedNumber = await generateAlert("APIキーを削除しますか？", "APIキーを削除すると、ウィジェットが正常に生成されなくなります。（「APIキーの取得」から再取得できます。）", options);
				if (selectedNumber !== 1) return;
				Keychain.remove("TIMETABLE_API_KEY");
				generateAlert("キー削除完了", "APIキーの削除は正常に完了しました。");
			} catch(error) {
				generateAlert("キー削除失敗", `APIキーの削除に失敗しました。\n${error}`);
			}
		}
	},
	{
		title: "学年",
		description: "学年を選択します。",
		currentValue: async function () {
			return generalSettings.general.grade || "未設定";
		},
		onSelect: async function () {
			
			try {
				const alert = new Alert();
				alert.title = "学年を入力";
				alert.message = "ウィジェットで表示する学年を入力してください。";
				const textField = alert.addTextField("学年(1~3)");
				textField.setPhonePadKeyboard();
				alert.addAction("OK");
				alert.addCancelAction("キャンセル");
				
				const selectedValue = await alert.present();
				if (selectedValue !== 0) return;
				generalSettings.general.grade = alert.textFieldValue(0);
				await saveSettings(generalSettings);
			} catch(error) {
				await generateAlert("エラー", `エラーが発生しました。\n${error}`);
			}
			
			
			
		}
	},
	{
		title: "クラス",
		description: "クラスを選択します。",
		currentValue: async function () {
			return generalSettings.general.class || "未設定";
		},
		onSelect: async function () {
			try {
				const alert = new Alert();
				alert.title = "クラスを入力";
				alert.message = "ウィジェットで表示するクラスを入力してください。";
				const textField = alert.addTextField("クラス(1~7)");
				textField.setPhonePadKeyboard();
				alert.addAction("OK");
				alert.addCancelAction("キャンセル");
				
				const selectedValue = await alert.present();
				if (selectedValue !== 0) return;
				generalSettings.general.class = alert.textFieldValue(0);
				await saveSettings(generalSettings);
			} catch(error) {
				await generateAlert("エラー", `エラーが発生しました。\n${error}`);
			}
		}
	}
]
			
//#########################################################################

const blockOptions = () => {
	return {
		nextBlock: [
			{
				title: "枠線の色",
				description: "ブロックの枠線の色。",
				currentValue: async function () {
					if (cache.exists("preference-normal-nextblock-border-color")) {
						return await cache.read("preference-normal-nextblock-border-color");
					} else {
						return "デフォルト";
					}
				},
				onSelect: async function () {
				
					try {
						const alert = new Alert();
						alert.title = "枠線の色を指定";
						alert.message = "枠線の色を16進数カラーコードで指定してください。"
						alert.addCancelAction("キャンセル");
						alert.addAction("OK");
						alert.addTextField(
							"カラーコード(例:#FFFFFF)",
							cache.exists("preference-normal-nextblock-border-color") ? await cache.read("preference-normal-nextblock-border-color") : ""
						);
				
						const selectedNumber = await alert.presentAlert();
						if (selectedNumber === -1) return;
						cache.write("preference-normal-nextblock-border-color", alert.textFieldValue(0));
					} catch(error) {
						await generateAlert("エラー", `エラーが発生しました。\n${error}`);
						console.error(error)
					}
				}
			},
			{
				title: "枠線の幅",
				description: "ブロックの枠線の幅。",
				currentValue: async function () {
					if (cache.exists("preference-normal-nextblock-border-width")) {
						return await cache.read("preference-normal-nextblock-border-width");
					} else {
						return "デフォルト";
					}
				},
				onSelect: async function () {
					try {
						const alert = new Alert();
						alert.title = "枠線の幅を指定";
						alert.message = "枠線の幅を整数で指定してください。"
						alert.addCancelAction("キャンセル");
						alert.addAction("OK");
						alert.addTextField(
							"幅(例:1)",
							cache.exists("preference-normal-nextblock-border-width") ? await cache.read("preference-normal-nextblock-border-width", true) : ""
						);
				
						const selectedNumber = await alert.presentAlert();
						if (selectedNumber === -1) return;
						cache.write("preference-normal-nextblock-border-width", alert.textFieldValue(0));
					} catch(error) {
						await generateAlert("エラー", `エラーが発生しました。\n${error}`);
						console.error(error)
					}
				}
			},
			{
				title: "文字の色",
				description: "ブロック内の文字の色。",
				currentValue: async function () {
					if (cache.exists("preference-normal-nextblock-font-color")) {
						return await cache.read("preference-normal-nextblock-font-color");
					} else {
						return "デフォルト";
					}
				},
				onSelect: async function () {
					
					try {
						const alert = new Alert();
						alert.title = "文字の色を指定";
						alert.message = "文字の色を16進数カラーコードで指定してください。"
						alert.addCancelAction("キャンセル");
						alert.addAction("OK");
						alert.addTextField(
							"カラーコード(例:#FFFFFF)",
							cache.exists("preference-normal-nextblock-font-color") ? await cache.read("preference-normal-nextblock-font-color") : ""
						);
					
						const selectedNumber = await alert.presentAlert();;
						if (selectedNumber === -1) return;
						cache.write("preference-normal-nextblock-font-color", alert.textFieldValue(0));
					} catch(error) {
						await generateAlert("エラー", `エラーが発生しました。\n${error}`);
						console.error(error)
					}
				}
			}
		],
		futureBlock: [
			{
				title: "枠線の色",
				description: "ブロックの枠線の色。",
				currentValue: async function () {
					if (cache.exists("preference-normal-futureblock-border-color")) {
						return await cache.read("preference-normal-futureblock-border-color");
					} else {
						return "デフォルト";
					}
				},
				onSelect: async function () {
				
					try {
						const alert = new Alert();
						alert.title = "枠線の色を指定";
						alert.message = "枠線の色を16進数カラーコードで指定してください。"
						alert.addCancelAction("キャンセル");
						alert.addAction("OK");
						alert.addTextField(
							"カラーコード(例:#FFFFFF)",
							cache.exists("preference-normal-futureblock-border-color") ? await cache.read("preference-normal-futureblock-border-color") : ""
						);
				
						const selectedNumber = await alert.presentAlert();;
						if (selectedNumber === -1) return;
						cache.write("preference-normal-futureblock-border-color", alert.textFieldValue(0));
					} catch(error) {
						await generateAlert("エラー", `エラーが発生しました。\n${error}`);
						console.error(error)
					}
				}
			},
			{
				title: "枠線の幅",
				description: "ブロックの枠線の幅。",
				currentValue: async function () {
					if (cache.exists("preference-normal-futureblock-border-width")) {
						return await cache.read("preference-normal-futureblock-border-width");
					} else {
						return "デフォルト";
					}
				},
				onSelect: async function () {
					try {
						const alert = new Alert();
						alert.title = "枠線の幅を指定";
						alert.message = "枠線の幅を整数で指定してください。"
						alert.addCancelAction("キャンセル");
						alert.addAction("OK");
						alert.addTextField(
							"幅(例:1)",
							cache.exists("preference-normal-futureblock-border-width") ? await cache.read("preference-normal-futureblock-border-width", true) : ""
						);
				
						const selectedNumber = await alert.presentAlert();
						if (selectedNumber === -1) return;
						cache.write("preference-normal-futureblock-border-width", alert.textFieldValue(0));
					} catch(error) {
						await generateAlert("エラー", `エラーが発生しました。\n${error}`);
						console.error(error)
					}
				}
			},
			{
				title: "文字の色",
				description: "ブロック内の文字の色。",
				currentValue: async function () {
					if (cache.exists("preference-normal-futureblock-font-color")) {
						return await cache.read("preference-normal-futureblock-font-color");
					} else {
						return "デフォルト";
					}
				},
				onSelect: async function () {
					
					try {
						const alert = new Alert();
						alert.title = "文字の色を指定";
						alert.message = "文字の色を16進数カラーコードで指定してください。"
						alert.addCancelAction("キャンセル");
						alert.addAction("OK");
						alert.addTextField(
							"カラーコード(例:#FFFFFF)",
							cache.exists("preference-normal-futureblock-font-color") ? await cache.read("preference-normal-futureblock-font-color") : ""
						);
					
						const selectedNumber = await alert.presentAlert();
						if (selectedNumber === -1) return;
						cache.write("preference-normal-futureblock-font-color", alert.textFieldValue(0));
					} catch(error) {
						await generateAlert("エラー", `エラーが発生しました。\n${error}`);
						console.error(error)
					}
				}
			}
		],
		clockBlock: [
			{
				title: "枠線の色",
				description: "ブロックの枠線の色。",
				currentValue: async function () {
					if (cache.exists("preference-normal-clockblock-border-color")) {
						return await cache.read("preference-normal-clockblock-border-color");
					} else {
						return "デフォルト";
					}
				},
				onSelect: async function () {
				
					try {
						const alert = new Alert();
						alert.title = "枠線の色を指定";
						alert.message = "枠線の色を16進数カラーコードで指定してください。"
						alert.addCancelAction("キャンセル");
						alert.addAction("OK");
						alert.addTextField(
							"カラーコード(例:#FFFFFF)",
							cache.exists("preference-normal-clockblock-border-color") ? await cache.read("preference-normal-clockblock-border-color") : ""
						);
				
						const selectedNumber = await alert.presentAlert();
						if (selectedNumber === -1) return;
						cache.write("preference-normal-clockblock-border-color", alert.textFieldValue(0));
					} catch(error) {
						await generateAlert("エラー", `エラーが発生しました。\n${error}`);
						console.error(error)
					}
				}
			},
			{
				title: "枠線の幅",
				description: "ブロックの枠線の幅。",
				currentValue: async function () {
					if (cache.exists("preference-normal-clockblock-border-width")) {
						return await cache.read("preference-normal-clockblock-border-width");
					} else {
						return "デフォルト";
					}
				},
				onSelect: async function () {
					try {
						const alert = new Alert();
						alert.title = "枠線の幅を指定";
						alert.message = "枠線の幅を整数で指定してください。"
						alert.addCancelAction("キャンセル");
						alert.addAction("OK");
						alert.addTextField(
							"幅(例:1)",
							cache.exists("preference-normal-clockblock-border-width") ? await cache.read("preference-normal-clockblock-border-width", true) : ""
						);
				
						const selectedNumber = await alert.presentAlert();
						if (selectedNumber === -1) return;
						cache.write("preference-normal-clockblock-border-width", alert.textFieldValue(0));
					} catch(error) {
						await generateAlert("エラー", `エラーが発生しました。\n${error}`);
						console.error(error)
					}
				}
			},
			{
				title: "文字の色",
				description: "ブロック内の文字の色。",
				currentValue: async function () {
					if (cache.exists("preference-normal-clockblock-font-color")) {
						return await cache.read("preference-normal-clockblock-font-color");
					} else {
						return "デフォルト";
					}
				},
				onSelect: async function () {
					
					try {
						const alert = new Alert();
						alert.title = "文字の色を指定";
						alert.message = "文字の色を16進数カラーコードで指定してください。"
						alert.addCancelAction("キャンセル");
						alert.addAction("OK");
						alert.addTextField(
							"カラーコード(例:#FFFFFF)",
							cache.exists("preference-normal-clockblock-font-color") ? await cache.read("preference-normal-clockblock-font-color") : ""
						);
					
						const selectedNumber = await alert.presentAlert();
						if (selectedNumber === -1) return;
						cache.write("preference-normal-clockblock-font-color", alert.textFieldValue(0));
					} catch(error) {
						await generateAlert("エラー", `エラーが発生しました。\n${error}`);
						console.error(error)
					}
				}
			}
		]
	}
}

//#########################################################################

const notifySettingOptions = [
	{
		title: "",
		onSelect: () => {
			
		}
	}
]

//#########################################################################


// 実行環境の確認
if (config.runsInWidget) {
	if (generalSettings.preference.theme === 'default') {
		switch(widgetSize) {
			case "small": widget = await createSmallWidget(1);
				break;
			case "medium": widget = await createMediumWidget();
				break;
			case "large": widget = await createLargeWidget();
				break;
			default: widget = await createSmallWidget(1);
		}	
	} else {
		switch(widgetSize) {
			case "small": widget = await createNewSmallWidget(1);
				break;
			case "medium": widget = await createMediumWidget(1);
				break;
			case "large": widget = await createLargeWidget();
				break;
			default: widget = await createNewSmallWidget(1);
		}
	}
	
  Script.setWidget(widget)
} else if (config.runsInApp) {
	
	menu : while (true) {
	
		const menuOptions = ['ウィジェットプレビュー', '初期設定', '見た目の設定', '通知設定', 'その他の設定', '閉じる'];
		const selectedNumber = await generateAlert("メニュー", "", menuOptions);
		
		switch (selectedNumber) {
			case 0: // ウィジェットプレビュー
				try {
					await createNewSmallWidget(1);
				} catch(error) {
					let alertTitle;
					let alertDescription;
					
					switch (error) {
						case "Unauthorized":
							alertTitle = "API認証エラー";
							alertDescription = "このウィジェットを利用するにはAPIの認証が必要です。「初期設定」からAPIの利用登録をしてください。";
							break;
						case "API Key error":
							alertTitle = "APIキーエラー";
							alertDescription = "登録されているAPIキーが無効または間違っています。「初期設定」より再度利用登録をしてください。";
							break;
						case "Server error":
							alertTitle = "APIサーバーエラー";
							alertDescription = "APIサーバーでエラーが発生しました。時間を置いて再度お試しください。";
							break;
						case "Request error":
							alertTitle = "APIリクエストエラー";
							alertDescription = "APIサーバーへのリクエストでエラーが発生しました。「初期設定」から学年・クラスを正しい値に設定してください。";
							break;
						case "Not found":
							alertTitle = "APIリクエストエラー";
							alertDescription = "APIサーバーに該当クラスの時間割データが存在しません。「サポート」→「時間割の追加依頼」で時間割を提供していただけると、データを受け取ることができるようになります。";
							break;
						default:
							alertTitle = "エラー";
							alertDescription = error.toString();
							break;
					}
					await generateAlert(alertTitle, alertDescription);
				}
				break;
			case 1: // 初期設定
				
				
				
				await generateUiTable("初期設定", "ウィジェットの初期設定。", initSettingOptions, 60, true);
				
				break;
			case 2: // 見た目の設定
				
				const preferenceOptions = [
					{
						title: "ウィジェットのスキン",
						description: "ウィジェットのスキンを選ぶことができます。",
						onSelect: async function () {
							const ui = new UITable();
							
							ui.showSeparators = true;
							
							const uiTitle = new UITableRow();
							uiTitle.height = 80;

							uiHeader = UITableCell.text("ウィジェットのスキン", "表示スタイル。");
							uiHeader.titleFont = Font.boldSystemFont(30);

							uiTitle.addCell(uiHeader);
							ui.addRow(uiTitle);
							
							const uiOption = new UITableRow();
							uiOption.height = 60;
							uiOption.dismissOnSelect = false;
							uiOption.onSelect = async function () {
								const selectedNumber = await generateAlert("スキンを選択", "ウィジェットのスキンを選択してください。", ['default', 'Flex', 'キャンセル']);
								switch (selectedNumber) {
									case 0:
										generalSettings.preference.theme = "default";
										break;
									case 1:
										generalSettings.preference.theme = "Flex";
										break;
									default:
										break;
								}
								await saveSettings(generalSettings);
								return;
							};
							
							
							
							// 項目
							uiText = UITableCell.text("スキン", "ウィジェットに適用するスキン。");
							uiText.titleFont = Font.body();
							uiText.subtitleFont = Font.caption1();
							uiText.subtitleColor = Color.gray();
							uiText.widthWeight = 50;
							uiOption.addCell(uiText);
						
							
							const uiCurrent = UITableCell.text(generalSettings.preference.theme);
							uiCurrent.titleFont = Font.body();
							uiCurrent.titleColor = Color.gray();
							uiCurrent.widthWeight = 47;
							uiCurrent.rightAligned();
							uiOption.addCell(uiCurrent);
					
							// ">"ボタン
							uiArrow = UITableCell.text("›");
							uiArrow.titleFont = Font.regularRoundedSystemFont(26);
							uiArrow.titleColor = Color.darkGray();
							uiArrow.widthWeight = 3;
							uiArrow.rightAligned();
							uiOption.addCell(uiArrow);
							
							ui.addRow(uiOption);
							
							const uiImages = new UITableRow();
							uiImages.height = 160;
							
							const image = UITableCell.imageAtURL("");
							uiImages.addCell(image);
							
							ui.addRow(uiImages);
							
							await ui.present();
							
						}
					}
				]
				
// 				const blockListOptions = {
// 					inSchool: [
// 						{
// 							title: “「次は」ブロック”,
// 							description: “「次は〜〜」を表示するブロックの見た目の設定です。”,
// 							onSelect: async function () {
// 								await generateUiTable(“「次は」ブロック”, “通常時のウィジェットの「次は」ブロックの見た目の設定。”, blockOptions().nextBlock, 60, true);
// 							}
// 						},
// 						{
// 							title: “「さらに後」ブロック”,
// 							description: “さらに後の授業を表示するブロックの見た目の設定です。”,
// 							onSelect: async function () {
// 								await generateUiTable(“「さらに後」ブロック”, “通常時のウィジェットの「さらに後」ブロックの見た目の設定。”, blockOptions().futureBlock, 60, true);
// 							}
// 						},
// 						{
// 							title: “時計ブロック”,
// 							description: “時計を表示するブロックの見た目の設定です。”,
// 							onSelect: async function () {
// 								await generateUiTable(“時計ブロック”, “通常時のウィジェットの時計ブロックの見た目の設定。”, blockOptions().clockBlock, 60, true);
// 							}
// 						}
// 					],
// 					afterSchool: [
// 						{
// 							title: “「明日の予定」ブロック”,
// 							description: “明日の予定を表示するブロックの見た目の設定です。”,
// 							onSelect: async function () {
// 								await generateUiTable(“「明日の予定」ブロック”, “放課後のウィジェットの「明日の予定」ブロックの見た目の設定。”, blockOptions.nextBlock, 60, true);
// 							}
// 						},
// 						{
// 							title: “「さらに後」ブロック”,
// 							description: “さらに後の授業を表示するブロックの見た目の設定です。”,
// 							onSelect: async function () {
// 								await generateUiTable(“外観設定（通常時）”, “通常時のウィジェットの「さらに後」ブロックの見た目の設定。”, blockOptions.futureBlock, 60, true);
// 							}
// 						},
// 						{
// 							title: “時計ブロック”,
// 							description: “時計を表示するブロックの見た目の設定です。”,
// 							onSelect: async function () {
// 								await generateUiTable(“時計ブロック”, “放課後のウィジェットの時計ブロックの見た目の設定。”, blockOptions.clockBlock, 60, true);
// 							}
// 						}
// 					]
// 				}
// 				
// 				const preferenceSettingOptions = [
// 					{
// 						title: “通常時のウィジェット”,
// 						description: “通常時（1〜6時間目）のウィジェットの見た目の設定です。”,
// 						onSelect: async function () {
// 							await generateUiTable(“外観設定（通常時）”, “通常時（1〜6時間目）のウィジェットの見た目の設定。”, blockListOptions.inSchool, 60, true);
// 						}
// 					},
// 					{
// 						title: “放課後のウィジェット”,
// 						description: “放課後のウィジェットの見た目の設定です。”,
// 						onSelect: async function () {
// 							await generateUiTable(“外観設定（放課後）”, “放課後のウィジェットの見た目の設定。”, blockListOptions.afterSchool, 60, true);
// 						}
// 					}
// 				]
				
				await generateUiTable("外観設定", "ウィジェットの見た目の設定。", preferenceOptions, 60, true);
				
				break;
				
			case 3: // 通知設定
				await generateUiTable("通知設定", "通知に関する設定。現在準備中。", notifySettingOptions, 60, true);
				
				break;
			case 4: // その他の設定
				const advancedSettingOptions = [
					{
						title: "アップデート",
						description: "このウィジェットのスクリプトを更新します。",
						onSelect: async function () {
							const options = ["キャンセル", "更新"];
							const selectedValue = await generateAlert("スクリプトを更新しますか？", "これまでの設定は保持されます。\n（スクリプトの更新にはインターネット接続が必要です。）", options);
							if (selectedValue === 0) return;
							await downloadCode(fileName, codeUrl)
							? await generateAlert("更新完了", "スクリプトは正常に更新されました。")
							: await generateAlert("更新失敗", "スクリプトの更新に失敗しました。インターネット接続があることを確認し、後でもう一度試してください。")
						}
					},
					{
						title: "時間割データ提供",
						description: "時間割のデータを提供してくれる方はこちらへお願いします。",
						onSelect: async function () {
							Safari.openInApp(formUrl);
						}
					},
					{
						title: "バージョン情報",
						description: "",
						currentValue: "1.0.0",
						onSelect: async () => {
							if (eEC === 4) {
								try {
									console.log("Easter Egg!")
									const webView = new WebView();
									await webView.loadHTML(html);
									await webView.present();
								} catch (error) {
									console.error(error)
								}
								
								eEC = 0;
							} else {
								eEC++;
							}
						}
					}
				]
				
				await generateUiTable("その他の設定", "その他の設定。", advancedSettingOptions, 60, true);
				break;
			case 5: // メニューを閉じる
				break menu;
			default:
				break menu;
		}
	}
}

Script.complete();