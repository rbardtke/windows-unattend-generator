/**
 * Software tab: search the winget catalog (data/winget-index.json, rebuilt weekly from the official
 * winget source) and keep a list of packages to install at first logon. The list lives in the hidden
 * form field "softwarePackages" (one id per line) so it travels with the configuration like any other
 * field; XmlGenerator turns it into InstallSoftware.ps1.
 */

class SoftwareTab {
    static index = null;
    static loading = null;

    static init() {
        this.field = document.getElementById('softwarePackages');
        this.search = document.getElementById('softwareSearch');
        this.results = document.getElementById('softwareResults');
        this.list = document.getElementById('softwareList');
        this.status = document.getElementById('softwareStatus');
        this.importBox = document.getElementById('softwareImport');
        if (!this.field) return;

        this.search.addEventListener('input', () => this.runSearch());
        this.search.addEventListener('focus', () => this.ensureIndex());
        this.search.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const first = this.results.querySelector('button[data-id]');
                if (first) first.click();
            }
        });
        document.getElementById('softwareImportBtn').addEventListener('click', () => this.importExport());
        document.getElementById('softwareClearBtn').addEventListener('click', () => this.setIds([]));
        document.querySelector('.tab-btn[data-tab="software"]').addEventListener('click', () => this.ensureIndex());
        // the field is also written by applyConfig (import, presets, links)
        this.field.addEventListener('change', () => this.renderList());
        this.renderList();
    }

    static ids() {
        return this.field.value.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    }

    static setIds(ids) {
        this.field.value = [...new Set(ids)].join('\n');
        this.field.dispatchEvent(new Event('input', { bubbles: true }));
        this.renderList();
    }

    static add(id) {
        this.setIds([...this.ids(), id]);
        this.search.value = '';
        this.results.innerHTML = '';
        this.search.focus();
    }

    static remove(id) {
        this.setIds(this.ids().filter(x => x !== id));
    }

    static async ensureIndex() {
        if (this.index || this.loading) return this.loading;
        this.status.textContent = 'Loading the winget catalog…';
        this.loading = fetch('data/winget-index.json')
            .then(r => { if (!r.ok) throw new Error(r.status + ' ' + r.statusText); return r.json(); })
            .then(data => {
                this.index = data;
                this.byId = new Map(data.packages.map(p => [p.i, p]));
                for (const p of data.packages) p.s = (p.i + ' ' + p.n + ' ' + (p.m || '') + ' ' + (p.t || []).join(' ')).toLowerCase();
                this.status.textContent = `${data.count.toLocaleString()} packages, catalog from ${data.generated.slice(0, 10)}`;
                this.renderList();
                if (this.search.value) this.runSearch();
            })
            .catch(err => {
                this.status.textContent = 'The winget catalog could not be loaded (' + err.message + '). You can still type package ids.';
                this.index = { packages: [], count: 0 };
                this.byId = new Map();
            });
        return this.loading;
    }

    static runSearch() {
        const q = this.search.value.trim().toLowerCase();
        this.results.innerHTML = '';
        if (!q) return;
        if (!this.index) { this.ensureIndex(); return; }
        const terms = q.split(/\s+/);
        const chosen = new Set(this.ids());
        const scored = [];
        for (const p of this.index.packages) {
            if (!terms.every(t => p.s.includes(t))) continue;
            let score = 0;
            if (p.i.toLowerCase() === q || (p.m && p.m.toLowerCase() === q)) score += 100;
            if (p.i.toLowerCase().startsWith(q)) score += 50;
            if (p.n.toLowerCase().startsWith(q)) score += 40;
            if (p.i.toLowerCase().includes(q)) score += 20;
            if (p.n.toLowerCase().includes(q)) score += 15;
            scored.push([score, p]);
            if (scored.length > 400) break;
        }
        scored.sort((a, b) => b[0] - a[0] || a[1].i.localeCompare(b[1].i));
        const frag = document.createDocumentFragment();
        for (const [, p] of scored.slice(0, 30)) {
            const row = document.createElement('div');
            row.className = 'software-result';
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn-small ' + (chosen.has(p.i) ? 'btn-secondary' : 'btn-primary');
            button.dataset.id = p.i;
            button.textContent = chosen.has(p.i) ? 'Added' : 'Add';
            button.disabled = chosen.has(p.i);
            button.addEventListener('click', () => this.add(p.i));
            const text = document.createElement('span');
            text.innerHTML = `<strong>${SoftwareTab.esc(p.n)}</strong> <code>${SoftwareTab.esc(p.i)}</code> <small>${SoftwareTab.esc(p.v)}</small>`;
            row.appendChild(button);
            row.appendChild(text);
            frag.appendChild(row);
        }
        if (!scored.length) {
            const none = document.createElement('div');
            none.className = 'software-result';
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn-small btn-secondary';
            button.textContent = 'Add as typed';
            button.addEventListener('click', () => this.add(this.search.value.trim()));
            none.appendChild(button);
            none.appendChild(document.createTextNode(' No match in the catalog. Add the id exactly as winget shows it.'));
            frag.appendChild(none);
        }
        this.results.appendChild(frag);
    }

    static renderList() {
        if (!this.list) return;
        const ids = this.ids();
        this.list.innerHTML = '';
        if (!ids.length) {
            this.list.innerHTML = '<p class="section-description">No packages yet. Search above, or paste the output of <code>winget export</code> below.</p>';
            return;
        }
        for (const id of ids) {
            const p = this.byId && this.byId.get(id);
            const row = document.createElement('div');
            row.className = 'software-result';
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn-small btn-danger';
            button.textContent = 'Remove';
            button.addEventListener('click', () => this.remove(id));
            const text = document.createElement('span');
            text.innerHTML = p
                ? `<strong>${SoftwareTab.esc(p.n)}</strong> <code>${SoftwareTab.esc(id)}</code> <small>${SoftwareTab.esc(p.v)}</small>`
                : `<code>${SoftwareTab.esc(id)}</code> <small>${this.index ? 'not in the catalog' : ''}</small>`;
            row.appendChild(button);
            row.appendChild(text);
            this.list.appendChild(row);
        }
    }

    /** Paste box: winget export JSON, or one id per line. */
    static importExport() {
        const text = this.importBox.value.trim();
        if (!text) return;
        let ids = [];
        try {
            const json = JSON.parse(text);
            for (const source of json.Sources || []) {
                if (source.SourceDetails && source.SourceDetails.Name && source.SourceDetails.Name !== 'winget') continue;
                for (const p of source.Packages || []) if (p.PackageIdentifier) ids.push(p.PackageIdentifier);
            }
        } catch (e) {
            ids = text.split(/[\s,;]+/).filter(s => /^[\w.+-]+\.[\w.+-]+$/.test(s));
        }
        if (!ids.length) {
            Utils.showNotification('No package ids found in the pasted text', 'error');
            return;
        }
        this.setIds([...this.ids(), ...ids]);
        this.importBox.value = '';
        Utils.showNotification(`${ids.length} package ids added`, 'success');
    }

    static esc(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
}
