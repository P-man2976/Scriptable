// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: code;
const widgetSize = config.widgetFamily;

// このスクリプトの名前を設定してください。
const fileName = module.filename;

const codeUrl = "https://raw.githubusercontent.com/P-man2976/Scriptable/master/Timetable-widget.js";

async function downloadCode(filename, url) {
	try {
		let fm = FileManager.local();
		const iCloudInUse = fm.isFileStoredIniCloud(module.filename);
		fm = iCloudInUse ? FileManager.iCloud() : fm;
		const codeString = await new Request(url).loadString();
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
	uiHeader.titleFont = Font.title1();

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
			const req = new Request(`http://192.168.1.2:3000${endpoint}?grade=${reqGrade}&class=${reqClass}&key=${Keychain.get("TIMETABLE_API_KEY")}`);
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
		const req = new Request(`http://192.168.1.2:3000/api/timetable/key?email=${email}&name=${name}`);
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

async function createSmallWidget(refreshInterval) {
	
	try {
		
		const timetable = JSON.parse(await fetchAPI("/api/timetable/now", await cache.read("timetableapi-grade"), await cache.read("timetableapi-class")));
		const widget = new ListWidget();
		widget.backgroundColor = new Color("#333");
		
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
			titleStack.borderColor = Color.white()
			titleStack.borderWidth = cache.exists("preference-normal-nextblock-border-width") ? Number(await cache.read("preference-normal-nextblock-border-width")) : 2;
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
			futureStack.borderColor = Color.white();
			futureStack.borderWidth = cache.exists("preference-normal-futureblock-border-width") ? Number(await cache.read("preference-normal-futureblock-border-width")) : 2;
			futureStack.size = new Size(73,60);
			futureStack.layoutVertically();
			
			timeStack.cornerRadius = 8;
			timeStack.borderColor = Color.white();
			timeStack.borderWidth = 2;
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
			const futurePrefixSpacer = futurePrefixStack.addSpacer(23)
			futurePrefix.font = Font.boldSystemFont(9)
		
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
			futureSubjectSecond.font = Font.boldSystemFont(13);
			
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
			time.applyTimeStyle();
			
			const date = currentDateStack.addText(dateString);
			date.font = new Font("DIN Alternate", 12);
			
			const currentDateSpacer = currentDateStack.addSpacer(1);
			
			const day = currentDateStack.addText(dayString);
			day.font = Font.boldSystemFont(12);
			
			const week = currentWeekStack.addText(timetable.week);
			week.font = new Font("DIN Alternate", 10);
		
			const currentWeekSpacer = currentWeekStack.addSpacer(2);
		
			const suffix = currentWeekStack.addText("週");
			suffix.font = Font.boldSystemFont(10);
			
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
			tomorrowStack.borderColor = Color.white();
			tomorrowStack.borderWidth = 2;
			tomorrowStack.size = new Size(68, 120);
			tomorrowStack.spacing = 2;
			tomorrowStack.setPadding(0, 8, 0, 0)
			tomorrowStack.centerAlignContent();
			tomorrowStack.layoutVertically();
			
			// 明日の授業
			const title = tomorrowStack.addText("明日の授業");
			title.font = Font.boldSystemFont(8);
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
					tomorrowSubject[index].centerAlignText();
				});
			}
			// 時計ブロック
			const timeStack = stack.addStack();
			timeStack.cornerRadius = 8;
			timeStack.borderColor = Color.white();
			timeStack.borderWidth = 2;
			timeStack.size = new Size(68, 68);
			
			await widget.presentSmall();
			return widget;
		}
		
	} catch(error) {
		throw error;
	}
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
			return cache.exists("timetableapi-grade") ? await cache.read("timetableapi-grade") : "未設定";
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
				cache.write("timetableapi-grade", alert.textFieldValue(0));
			} catch(error) {
				await generateAlert("エラー", `エラーが発生しました。\n${error}`);
			}
			
			
			
		}
	},
	{
		title: "クラス",
		description: "クラスを選択します。",
		currentValue: async function () {
			return cache.exists("timetableapi-class") ? await cache.read("timetableapi-class") : "未設定";
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
				cache.write("timetableapi-class", alert.textFieldValue(0));
			} catch(error) {
				await generateAlert("エラー", `エラーが発生しました。\n${error}`);
			}
		}
	}
]
			
//#########################################################################

const blockOptions = {
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
			
					const selectedNumber = await alert.presentAlert();;
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

//#########################################################################

const notifySettingOptions = [
	{
		title: ""
	}
]

//#########################################################################


// 実行環境の確認
if (config.runsInWidget) {
  switch(widgetSize) {
    case "small": widget = await createSmallWidget(1);
    break;
    case "medium": widget = await createMediumWidget();
    break;
    case "large": widget = await createLargeWidget();
    break;
    default: widget = await createMediumWidget();
  }
  Script.setWidget(widget)
} else if (config.runsInApp) {
	
	menu : while (true) {
	
		const menuOptions = ['ウィジェットプレビュー', '初期設定', '見た目の設定', '通知設定', 'その他の設定', '閉じる'];
		const selectedNumber = await generateAlert("メニュー", "", menuOptions);
		
		switch (selectedNumber) {
			case 0: // ウィジェットプレビュー
				try {
					await createSmallWidget(1);
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
			
				const blockListOptions = {
					inSchool: [
						{
							title: "「次は」ブロック",
							description: "「次は〜〜」を表示するブロックの見た目の設定です。",
							onSelect: async function () {
								await generateUiTable("「次は」ブロック", "通常時のウィジェットの「次は」ブロックの見た目の設定。", blockOptions.nextBlock, 60, true);
							}
						},
						{
							title: "「さらに後」ブロック",
							description: "さらに後の授業を表示するブロックの見た目の設定です。",
							onSelect: async function () {
								await generateUiTable("「さらに後」ブロック", "通常時のウィジェットの「さらに後」ブロックの見た目の設定。", blockOptions.futureBlock, 60, true);
							}
						},
						{
							title: "時計ブロック",
							description: "時計を表示するブロックの見た目の設定です。",
							onSelect: async function () {
								await generateUiTable("時計ブロック", "通常時のウィジェットの時計ブロックの見た目の設定。", blockOptions.clockBlock, 60, true);
							}
						}
					],
					afterSchool: [
						{
							title: "「明日の予定」ブロック",
							description: "明日の予定を表示するブロックの見た目の設定です。",
							onSelect: async function () {
								await generateUiTable("「明日の予定」ブロック", "放課後のウィジェットの「明日の予定」ブロックの見た目の設定。", blockOptions.nextBlock, 60, true);
							}
						},
						{
							title: "「さらに後」ブロック",
							description: "さらに後の授業を表示するブロックの見た目の設定です。",
							onSelect: async function () {
								await generateUiTable("外観設定（通常時）", "通常時のウィジェットの「さらに後」ブロックの見た目の設定。", blockOptions.futureBlock, 60, true);
							}
						},
						{
							title: "時計ブロック",
							description: "時計を表示するブロックの見た目の設定です。",
							onSelect: async function () {
								await generateUiTable("時計ブロック", "放課後のウィジェットの時計ブロックの見た目の設定。", blockOptions.clockBlock, 60, true);
							}
						}
					]
				}
				
				const preferenceSettingOptions = [
					{
						title: "通常時のウィジェット",
						description: "通常時（1〜6時間目）のウィジェットの見た目の設定です。",
						onSelect: async function () {
							await generateUiTable("外観設定（通常時）", "通常時（1〜6時間目）のウィジェットの見た目の設定。", blockListOptions.inSchool, 60, true);
						}
					},
					{
						title: "放課後のウィジェット",
						description: "放課後のウィジェットの見た目の設定です。",
						onSelect: async function () {
							await generateUiTable("外観設定（放課後）", "放課後のウィジェットの見た目の設定。", blockListOptions.afterSchool, 60, true);
						}
					}
				]
				
				await generateUiTable("外観設定", "ウィジェットの見た目の設定。", preferenceSettingOptions, 60, true);
				
				break;
				
			case 3: // 通知設定
				
				break;
			case 4: // その他の設定
				const advancedSettingOptions = [
					{
						title: "アップデート",
						description: "このウィジェットのスクリプトを更新します。",
						onSelect: async function () {
							const options = ["キャンセル", "更新"];
							const selectedValue = await generateAlert("スクリプトを更新しますか？", "これまでの設定は保持されます。\n（スクリプトの更新にはインターネット接続が必要です。）", options);
							console.log(selectedValue);
							if (selectedValue === 0) return;
							
							await downloadCode(fileName, codeUrl)
							? await generateAlert("更新完了", "スクリプトは正常に更新されました。")
							: await generateAlert("更新失敗", "スクリプトの更新に失敗しました。インターネット接続があることを確認し、後でもう一度試してください。")
						}
					},
					{
						title: "バージョン情報",
						description: "",
						currentValue: "1.0",
						onSelect: async function () {
							
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