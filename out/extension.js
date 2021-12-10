// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode_1 = require('vscode');
// this method is called when your extension is activated. activation is
// controlled by the activation events defined in package.json
function activate(ctx) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    // console.log('Congratulations, your extension "Wordcount" is now active!');
    // create a new word counter
    var wordCounter = new WordCounter();
    var controller = new WordCounterController(wordCounter);
    // add to a list of disposables which are disposed when this extension
    // is deactivated again.
    ctx.subscriptions.push(controller);
    ctx.subscriptions.push(wordCounter);
}
exports.activate = activate;
var WordCounter = (function () {
    function WordCounter() {
    }
    WordCounter.prototype.updateWordCount = function () {
        // Create as needed
        if (!this._statusBarItem) {
            this._statusBarItem = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Left);
        }
        // Get the current text editor
        var editor = vscode_1.window.activeTextEditor;
        if (!editor) {
            this._statusBarItem.hide();
            return;
        }
        var doc = editor.document;
        // Only update status if an MD file
        if (doc.languageId === "markdown" || doc.languageId === "plaintext") {
            var docContent;
            if (editor.selection.isEmpty) {
                docContent = doc.getText();
            }
            else {
                docContent = editor.document.getText(editor.selection);
            }
            var wordCount = this._getWordCount(docContent);
            // Update the status bar
            this._statusBarItem.text = wordCount !== 1 ? "$(pencil) " + wordCount + " Words" : '$(pencil) 1 Word';
            this._statusBarItem.show();
        }
        else {
            this._statusBarItem.hide();
        }
    };
    WordCounter.prototype._getWordCount = function (docContent) {
        var wordCount = 0;
        if (docContent != "") {
            // See: https://stackoverflow.com/questions/20396456/how-to-do-word-counts-for-a-mixture-of-english-and-chinese-in-javascript
            // fix problem in special characters such as middle-dot, etc.  
            docContent = docContent.replace(/[\u007F-\u00FE]/g,' ');
            // remove all CJK characters and then count the number of english characters in the string
            docContentEn = docContent.replace(/[^!-~\d\s]+/gi,' ')
            var matchesEn = docContentEn.match(/[\u00ff-\uffff]|\S+/g);
            countEn = matchesEn ? matchesEn.length : 0;
            // remove all english characters and then count the number of CJK characters in the string
            docContentCJK = docContent.replace(/[!-~\d\s]+/gi,'')
            var matchesCJK = docContentCJK.match(/[\u00ff-\uffff]|\S+/g);
            countCJK = matchesCJK ? matchesCJK.length : 0;
            // sum
            wordCount = countEn + countCJK;
        }
        return wordCount;
    };
    WordCounter.prototype.dispose = function () {
        this._statusBarItem.dispose();
    };
    return WordCounter;
})();
exports.WordCounter = WordCounter;
var WordCounterController = (function () {
    function WordCounterController(wordCounter) {
        this._wordCounter = wordCounter;
        this._wordCounter.updateWordCount();
        // subscribe to selection change and editor activation events
        var subscriptions = [];
        vscode_1.window.onDidChangeTextEditorSelection(this._onEvent, this, subscriptions);
        vscode_1.window.onDidChangeActiveTextEditor(this._onEvent, this, subscriptions);
        // create a combined disposable from both event subscriptions
        this._disposable = vscode_1.Disposable.from.apply(vscode_1.Disposable, subscriptions);
    }
    WordCounterController.prototype._onEvent = function () {
        this._wordCounter.updateWordCount();
    };
    WordCounterController.prototype.dispose = function () {
        this._disposable.dispose();
    };
    return WordCounterController;
})();
//# sourceMappingURL=extension.js.map