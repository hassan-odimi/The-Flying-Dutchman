<h1>Welcome to The Flying Dutchman!</h1>

<p>This is our submission for User Interface I. <a href="http://www.engpappa.com/dutchman/">Online Version</a></p>

<img src="https://i.imgur.com/UZSXGaC.png">

<h2>Group Members are:</h2>
<ul>
    <li>Mauro José Pappaterra</li>
    <li>Jenny Olsson</li>
    <li>Hassan Odimi</li>
    <li>Yawen Yi</li>
    <li>Elsa Slättegård</li>
</ul>

<hr>

<h2>Files Distribution</h2>

<h3>Folders:</h3>
<ul>
    <li><b>css:</b> All CSS files go here</li>
    <li><b>db:</b> All database files go here</li>
    <li><b>img:</b> All image files go here</li>
    <li><b>img/background:</b> All background pics go here</li>
    <li><b>img/drinks:</b> All drinks image files go here</li>
    <li><b>img/logos:</b> All logo pics go here</li>
    <li><b>js:</b> All JavaScript files go here</li>
    <li><b>js/view:</b> All multilanguage display texts go here</li>
</ul>

<h3>Files:</h3>

<h4>General:</h4>
<ul>
    <li><b>index.html:</b> Index page</li>
    <li><b>bartender.html:</b> Bartender view</li>
    <li><b>customer.html:</b> Customer view</li>
    <li><b>management.html:</b> Management view</li>
</ul>

<h4>css:</h4>
<ul>
    <li><b>style.css:</b> style sheet common to all pages</li>
    <li><b>index.css:</b> style sheet for index page</li>
    <li><b>login.css:</b> style sheet for login view</li>
    <li><b>bartender.css:</b> style sheet for bartender view</li>
    <li><b>customer.css:</b> style sheet for customer view</li>
    <li><b>management.css:</b> style sheet for management view</li>
</ul>

<h4>db:</h4>
<ul>
    <li><b>DB.js:</b> The Flying Dutchman's own dummy database</li>
    <li><b>DB_MIKES.js</b> The database of special drinks</li>
    <li><b>DB_SYSTEMBOLAGET.js:</b> Systembolaget's dummy database</li>
</ul>

<h4>js:</h4>
<ul>
    <li><b>multilanguage.js:</b> Script for multilanguage functionality</li>
    <li><b>index.js:</b> Scripts for log in screen</li>
    <li><b>bartender.js:</b> Scripts for bartender view</li>
    <li><b>customer.js:</b> Scripts for customer view</li>
    <li><b>management.js:</b> Scripts for management view</li>
</ul>

<h4>js/view:</h4>
<ul>
    <li><b>view_common.js:</b> All common multilanguage texts</li>
    <li><b>view_index.js:</b> Multilanguage texts for for index page</li>
    <li><b>view_login.js:</b> Multilanguage texts for for login dialogue box</li>
    <li><b>view_bartender.js:</b> Multilanguage texts or bartender view</li>
    <li><b>view_customer.js:</b> Multilanguage texts for customer view</li>
    <li><b>view_management.js:</b> Multilanguage texts for management view</li>
</ul>

<h4>img:</h4>
<ul>
    <li><b>favicon.png:</b> Icon for browser</li>
    <li><b>esp.png:</b> Flag Spain</li>
    <li><b>eng.png:</b> Flag Union Jack</li>
    <li><b>sve.png:</b> Flag Sweden</li>
    <li><b>ita.svg:</b> Flag Italy</li>
    <li><b>pirate.jpg:</b> Pirates Flag</li>
    <li><b>background.jpg:</b> Background pic for users views</li>
    <li><b>wallpaper3.jpg:</b> Background pic for users viewsg</li>
    <li><b>wood.jpg:</b> Veins for users views</li>
    <li><b>logo.jpg:</b> Pirate theme logo</li>
    <li><b>storm.jpg:</b> Background pic for index page</li>


</ul>

<h4>Other:</h4>
<ul>
    <li><b>.gitignore:</b> Use this file to avoid pushing redundant files, add any IDE configuration files you might use </li>
    <li><b>README.md:</b> The contents of this very file.</li>
</ul>




<hr>

<h2>Polish Project (2026): AI Tooling</h2>

<p>The 2026 polish pass (branch <code>polish</code>) uses Claude Code with the agent skills below. The skill folders live in <code>.claude/skills/</code>, which is git-ignored, so each one must be reinstalled from its source after cloning. Targets: WCAG 2.2 AA, pirate theme kept.</p>

<h3>Project skills (<code>.claude/skills/</code>)</h3>
<ul>
    <li><b>impeccable</b> (v4.8.0, <a href="https://github.com/pbakaus/impeccable">pbakaus/impeccable</a> @ 5adaee7, Apache 2.0): design direction and review. <code>init</code> and <code>document</code> write PRODUCT.md and DESIGN.md from the current code; <code>critique</code>, <code>audit</code> and <code>polish</code> review the views. Decides <i>where</i> motion helps. Detector hooks are off.</li>
    <li><b>ui-ux-pro-max</b> (<a href="https://github.com/nextlevelbuilder/ui-ux-pro-max-skill">nextlevelbuilder/ui-ux-pro-max-skill</a> @ 28b3b8d): searchable reference data for palettes, font pairings and UX guidelines. Used to check colour, type and interaction choices.</li>
    <li><b>transitions-dev</b> (<a href="https://github.com/jakubantalik/transitions.dev">jakubantalik/transitions.dev</a> @ 6a7d682): copy-ready CSS micro-interactions (toast, modal, success check, error shake, accordion) and the motion tokens on <code>:root</code>. Owns <i>how</i> things move. Every snippet has a <code>prefers-reduced-motion</code> guard.</li>
    <li><b>transitions-polish</b> (same repo): audits existing CSS motion against the transitions.dev tokens.</li>
</ul>

<p>Reinstall: copy each skill folder from its repo (<code>.claude/skills/impeccable</code>, <code>.claude/skills/ui-ux-pro-max</code>, <code>skills/transitions-dev</code>, <code>skills/transitions-polish</code>) into <code>.claude/skills/</code>.</p>

<h3>Accessibility testing</h3>
<ul>
    <li><b><a href="https://github.com/dequelabs/axe-core">axe-core</a></b> 4.10.2 (open source, MPL 2.0), loaded from cdnjs into each page in the browser and run with <code>axe.run()</code> against the WCAG 2.2 AA tags. No install, no account.</li>
    <li>Manual keyboard and screen-reader walkthroughs, because automated scans find only part of the WCAG issues.</li>
</ul>

<h3>General-purpose skills (user level)</h3>
<ul>
    <li><b>investigate-first</b>, <b>surgical-patch</b>, <b>safe-refactor</b>: bug diagnosis, small fixes and behaviour-preserving cleanup.</li>
    <li><b>playwright-cli</b>, <b>verify-and-stop</b>: checks each change in a real browser.</li>
    <li><b>code-review</b>: reviews each phase before commit.</li>
</ul>
