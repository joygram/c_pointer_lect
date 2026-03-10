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
