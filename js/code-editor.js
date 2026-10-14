/**
 * Code Editor - syntax highlighting for the script textareas, without any dependency.
 *
 * A <pre> with highlighted tokens sits behind a transparent <textarea>; both share font, padding
 * and wrapping, and scroll together, so the textarea keeps doing the editing while the <pre> does
 * the colouring. Supported languages: ps1, cmd, reg, vbs, js.
 */

class CodeEditor {
    static LANGUAGES = {
        ps1: [
            ['comment', /<#[\s\S]*?#>|#[^\n]*/],
            ['string', /@"[\s\S]*?"@|@'[\s\S]*?'@|"(?:`.|[^"`])*"|'(?:''|[^'])*'/],
            ['variable', /\$(?:\{[^}]*\}|[A-Za-z_][\w:]*|[$?^_])/],
            ['keyword', /\b(?:if|else|elseif|foreach|for|while|do|until|switch|function|param|return|try|catch|finally|throw|break|continue|in|begin|process|end|filter|class|enum|using|trap|exit)\b/i],
            ['cmdlet', /\b[A-Z][a-z]+-[A-Za-z]\w*\b/],
            ['param', /(?<=[\s(,])-{1,2}[A-Za-z][\w-]*/],
            ['type', /\[[A-Za-z][\w.]*(?:\[\])?\]/],
            ['number', /\b\d+(?:\.\d+)?(?:[kmg]b)?\b/i],
            ['operator', /\||&|;|=|\{|\}|\(|\)/],
        ],
        cmd: [
            ['comment', /^[ \t]*(?:rem\b[^\n]*|::[^\n]*)/im],
            ['label', /^[ \t]*:[A-Za-z_][\w-]*/m],
            ['string', /"[^"\n]*"/],
            ['variable', /%(?:~[a-z]*)?[\w:~=-]*%|![\w:~=-]+!|%%?~?[A-Za-z]/],
            ['keyword', /\b(?:echo|set|setlocal|endlocal|if|else|not|exist|defined|errorlevel|goto|call|exit|for|in|do|start|pause|shift|cd|md|rd|del|copy|xcopy|move|ren|type|cls|title|timeout|choice|reg|net|sc|powershell|dism|diskpart|select|clean|convert|create|format|assign|partition|primary|efi|msr|quick|fs|label|letter|size|gpt|mbr|disk)\b/i],
            ['number', /\b\d+\b/],
            ['operator', /[|&><@()]/],
        ],
        reg: [
            ['comment', /;[^\n]*/],
            ['header', /^\[[^\n\]]*\]/m],
            ['keyword', /^Windows Registry Editor Version [\d.]+|^REGEDIT4/m],
            ['string', /"(?:\\.|[^"\\\n])*"/],
            ['type', /\b(?:dword|hex(?:\([0-9a-f]+\))?|qword)\b:?/i],
            ['number', /\b[0-9a-f]{2,8}\b/i],
            ['operator', /=|@|-/],
        ],
        vbs: [
            ['comment', /'[^\n]*|\bRem\b[^\n]*/i],
            ['string', /"(?:""|[^"\n])*"/],
            ['keyword', /\b(?:Dim|Set|If|Then|Else|ElseIf|End|Sub|Function|Call|For|Each|Next|To|Step|Do|Loop|While|Wend|Until|Const|On|Error|Resume|Exit|Select|Case|With|Not|And|Or|Is|Nothing|True|False|Null|Empty|New|Private|Public|ReDim|ByVal|ByRef|Option|Explicit|Class)\b/i],
            ['cmdlet', /\b(?:WScript|CreateObject|GetObject|MsgBox|InputBox|Len|Mid|Left|Right|Trim|UCase|LCase|Replace|Split|Join|InStr|CStr|CInt|CLng|IsNull|IsEmpty|Err)\b/i],
            ['number', /\b\d+(?:\.\d+)?\b/],
            ['operator', /[=&+\-*/<>()]/],
        ],
        js: [
            ['comment', /\/\/[^\n]*|\/\*[\s\S]*?\*\//],
            ['string', /"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`/],
            ['keyword', /\b(?:var|let|const|function|return|if|else|for|in|of|while|do|switch|case|default|break|continue|new|try|catch|finally|throw|typeof|instanceof|this|null|undefined|true|false|class|extends|async|await|delete|void)\b/],
            ['cmdlet', /\b(?:WScript|WSH|ActiveXObject|Shell|Run|Echo|Quit|Sleep|CreateObject|GetObject|console)\b/],
            ['number', /\b\d+(?:\.\d+)?\b/],
            ['operator', /[=+\-*/<>!&|?:;{}()[\]]/],
        ],
    };

    /** Aliases accepted from the script type selectors. */
    static normalizeLanguage(language) {
        const l = String(language || '').toLowerCase();
        return CodeEditor.LANGUAGES[l] ? l : (l === 'bat' ? 'cmd' : l === 'powershell' ? 'ps1' : 'plain');
    }

    static escape(text) {
        return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    /** Return HTML with <span class="tok-…"> wrappers for the given language. */
    static highlight(text, language) {
        const rules = CodeEditor.LANGUAGES[CodeEditor.normalizeLanguage(language)];
        if (!rules) return CodeEditor.escape(text);
        const compiled = rules.map(([name, re]) => [name, new RegExp(re.source, re.flags.replace('g', '') + 'y')]);
        let out = '';
        let pos = 0;
        let plainStart = 0;
        while (pos < text.length) {
            let matched = null;
            for (const [name, re] of compiled) {
                re.lastIndex = pos;
                const m = re.exec(text);
                if (m && m[0].length > 0) { matched = [name, m[0]]; break; }
            }
            if (matched) {
                if (plainStart < pos) out += CodeEditor.escape(text.slice(plainStart, pos));
                out += `<span class="tok-${matched[0]}">${CodeEditor.escape(matched[1])}</span>`;
                pos += matched[1].length;
                plainStart = pos;
            } else {
                pos++;
            }
        }
        if (plainStart < text.length) out += CodeEditor.escape(text.slice(plainStart));
        return out;
    }

    /** Turn a textarea into a highlighted editor. Safe to call twice. */
    static enhance(textarea, language) {
        if (!textarea || textarea.dataset.codeEditor) {
            if (textarea && language !== undefined) CodeEditor.setLanguage(textarea, language);
            return;
        }
        const wrapper = document.createElement('div');
        wrapper.className = 'code-editor';
        const pre = document.createElement('pre');
        pre.className = 'code-editor-highlight';
        pre.setAttribute('aria-hidden', 'true');
        const code = document.createElement('code');
        pre.appendChild(code);

        textarea.parentNode.insertBefore(wrapper, textarea);
        wrapper.appendChild(pre);
        wrapper.appendChild(textarea);
        textarea.classList.add('code-textarea');
        textarea.spellcheck = false;
        textarea.setAttribute('autocapitalize', 'off');
        textarea.setAttribute('autocomplete', 'off');
        textarea.dataset.codeEditor = '1';
        textarea.dataset.language = CodeEditor.normalizeLanguage(language);

        const render = () => {
            code.innerHTML = CodeEditor.highlight(textarea.value, textarea.dataset.language) + '\n';
            pre.scrollTop = textarea.scrollTop;
            pre.scrollLeft = textarea.scrollLeft;
        };
        textarea._codeEditorRender = render;
        textarea.addEventListener('input', render);
        textarea.addEventListener('change', render);
        textarea.addEventListener('scroll', () => {
            pre.scrollTop = textarea.scrollTop;
            pre.scrollLeft = textarea.scrollLeft;
        });
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && !e.ctrlKey && !e.altKey && !e.metaKey) {
                e.preventDefault();
                textarea.setRangeText('\t', textarea.selectionStart, textarea.selectionEnd, 'end');
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
        render();
    }

    static setLanguage(textarea, language) {
        if (!textarea || !textarea.dataset.codeEditor) return;
        textarea.dataset.language = CodeEditor.normalizeLanguage(language);
        textarea._codeEditorRender();
    }

    /** Re-render every editor (after a programmatic form update). */
    static refreshAll() {
        document.querySelectorAll('textarea[data-code-editor]').forEach(t => t._codeEditorRender());
    }
}

if (typeof module !== 'undefined') module.exports = CodeEditor;
