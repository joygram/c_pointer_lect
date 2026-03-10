/**
 * 실습 코드 에디터: CodeMirror 초기화, C 포맷, 복사
 * 모든 데이터(기본 코드)는 각 HTML 페이지의 textarea에 임베드됨
 */
(function () {
  'use strict';

  var INDENT = '    ';  // 4 spaces

  function formatC(code) {
    var lines = code.split('\n').map(function (l) { return l.trim(); });
    var result = [];
    var level = 0;
    var i, line, trimmed, pre;

    for (i = 0; i < lines.length; i++) {
      line = lines[i];
      trimmed = line.trim();
      if (trimmed === '') {
        result.push('');
        continue;
      }
      if (trimmed.charAt(0) === '}') level = Math.max(0, level - 1);
      pre = '';
      for (var k = 0; k < level; k++) pre += INDENT;
      result.push(pre + trimmed);
      for (var j = 0; j < trimmed.length; j++) {
        if (trimmed.charAt(j) === '{') level++;
        if (trimmed.charAt(j) === '}') level = Math.max(0, level - 1);
      }
    }
    return result.join('\n').trim() + '\n';
  }

  function initPracticeEditor(editorId, toolbarId) {
    var textarea = document.getElementById(editorId);
    if (!textarea) return null;

    var defaultCode = textarea.value;
    var container = textarea.parentNode;
    textarea.style.display = 'none';

    var editor = CodeMirror(container, {
      value: defaultCode,
      mode: 'text/x-csrc',
      theme: 'tomorrow-night-eighties',
      lineNumbers: true,
      indentUnit: 4,
      indentWithTabs: false,
      lineWrapping: true,
      extraKeys: {
        'Ctrl-Space': 'autocomplete',
        'Tab': function (cm) {
          cm.replaceSelection(INDENT, 'end');
        }
      }
    });

    var formatBtn = document.getElementById(toolbarId + '-format');
    var copyBtn = document.getElementById(toolbarId + '-copy');
    var runBtn = document.getElementById(toolbarId + '-run');
    var resultBox = document.getElementById(toolbarId + '-result');
    if (formatBtn) {
      formatBtn.addEventListener('click', function () {
        var code = editor.getValue();
        try {
          editor.setValue(formatC(code));
        } catch (e) {
          editor.setValue(code);
        }
      });
    }
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        navigator.clipboard.writeText(editor.getValue()).then(function () {
          var t = copyBtn.textContent;
          copyBtn.textContent = '복사됨!';
          setTimeout(function () { copyBtn.textContent = t; }, 1500);
        });
      });
    }
    if (runBtn && resultBox) {
      runBtn.addEventListener('click', function () {
        var code = editor.getValue();
        if (!code.trim()) {
          resultBox.textContent = '(코드를 입력한 뒤 실행하세요)';
          resultBox.className = toolbarId + '-result';
          return;
        }
        runBtn.disabled = true;
        resultBox.textContent = '실행 중…';
        resultBox.className = toolbarId + '-result running';
        fetch('https://emkc.org/api/v2/piston/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language: 'c',
            version: '10.2.0',
            files: [{ name: 'main.c', content: code }],
            stdin: '',
            compile_timeout: 10000,
            run_timeout: 5000
          })
        })
          .then(function (res) { return res.json(); })
          .then(function (data) {
            runBtn.disabled = false;
            var out = '';
            if (data.compile && data.compile.stderr) {
              out += '[컴파일]\n' + data.compile.stderr + '\n';
            }
            if (data.run) {
              if (data.run.stdout) out += data.run.stdout;
              if (data.run.stderr) out += data.run.stderr;
              if (data.run.signal) out += '\n(신호: ' + data.run.signal + ')';
              if (out === '' && data.run.code !== undefined) out = '(종료 코드: ' + data.run.code + ')';
            }
            resultBox.textContent = out || '(출력 없음)';
            resultBox.className = toolbarId + '-result ' + (data.run && data.run.code === 0 ? 'ok' : 'error');
          })
          .catch(function (err) {
            runBtn.disabled = false;
            resultBox.textContent = '실행 실패 (네트워크 또는 CORS). 복사 후 온라인 컴파일러에서 실행해 보세요.';
            resultBox.className = toolbarId + '-result error';
          });
      });
    }

    /* 포커스를 잃을 때 자동 포맷 (오토 포맷) */
    editor.on('blur', function () {
      var code = editor.getValue();
      if (!code.trim()) return;
      try {
        var formatted = formatC(code);
        if (formatted !== code) editor.setValue(formatted);
      } catch (e) { /* 포맷 실패 시 원본 유지 */ }
    });

    return editor;
  }

  window.PracticeEditor = {
    formatC: formatC,
    init: initPracticeEditor
  };
})();
