require.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.27.0/min/vs",
  },
});

const consoleLines = document.getElementById("console-lines");

function editorExec() {
  let inputValue = window.editor.getValue();
  var onError = function (e) {
    console.error(e);
  };
  var biwa = new BiwaScheme.Interpreter(onError);
  biwa.evaluate(inputValue, function (result) {
    if (typeof result !== "undefined") {
      const isScrolledToBottom =
        consoleLines.scrollHeight - consoleLines.clientHeight <=
        consoleLines.scrollTop + 1;
      let newItem = document.createElement("div");
      newItem.innerText = result.toString();
      consoleLines.appendChild(newItem);
      if (isScrolledToBottom) {
        consoleLines.scrollTop =
          consoleLines.scrollHeight - consoleLines.clientHeight;
      }
    }
  });
}

require(["vs/editor/editor.main"], function () {
  const schemeKeywords = [
    "define",
    "lambda",
    "if",
    "set!",
    "begin",
    "cond",
    "and",
    "or",
    "case",
    "let",
    "let*",
    "letrec",
    "do",
    "delay",
    "quote",
    "quasiquote",
    "define-syntax",
    "let-syntax",
    "letrec-syntax",
    "syntax-rules",
  ];

  monaco.languages.registerCompletionItemProvider("scheme", {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position).word.toLowerCase();

      return {
        suggestions: schemeKeywords
          .filter((k) => k.startsWith(word))
          .map((keyword) => ({
            label: keyword,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: keyword,
          })),
      };
    },
  });

  window.editor = monaco.editor.create(document.getElementById("editor"), {
    value: "(* 50 10)",
    language: "scheme",
    automaticLayout: true,
    theme: "vs-dark",
  });
});

document.getElementById("run").addEventListener("click", editorExec);

const split = document.querySelector("#split");
const gutter = document.querySelector(".gutter");

let dragging = false;

gutter.addEventListener("pointerdown", (e) => {
  dragging = true;
  gutter.setPointerCapture(e.pointerId);
});

gutter.addEventListener("pointermove", (e) => {
  if (!dragging) return;

  const rect = split.getBoundingClientRect();
  const y = e.clientY - rect.top;
  const min = 120;
  const gutterHeight = 2;
  const up = Math.max(min, Math.min(y, rect.height - min - gutterHeight));

  split.style.gridTemplateRows = `${up}px ${gutterHeight}px 1fr`;
});

gutter.addEventListener("pointerup", () => {
  dragging = false;
});

gutter.addEventListener("pointercancel", () => {
  dragging = false;
});

hotkeys("ctrl+enter", (event, handler) => {
  switch (handler.key) {
    case "ctrl+enter":
      editorExec();
      break;
  }
});
