
const TAB_INDEX_WORKSPACE = 0;
const TAB_INDEX_SOURCE = 1;
const TAB_INDEX_SETTING = 2;

var touchedCssMenu = false;

window.onload = function () {

    /* ブラウザの右クリックメニューを使えなくする */
    document.getElementsByTagName('html')[0].oncontextmenu = function () { return false; }
    initStyle();

    document.body.addEventListener('front-window', function (e) {
        const elWnd = document.getElementById('front-window');
        elWnd.style.display = "none";
    });

    /* タブの初期活性 */
    setSelectTab('system', TAB_INDEX_WORKSPACE);
    setSelectTab('html-tab', 0);

    initMenuEvent('css-frame', 'css-menu');
    initMenuEvent('html-frame', 'html-menu');

    initCssTree();
    initHtmlTree();

    initFrontWndEvent();

}

function initTagSelectBox() {
    const box = document.getElementById('html-tag');
}

function initFrontWndEvent() {
    const frontWnd = document.getElementById('front-window');
    const previewWnd = document.getElementById('preview-window');
    frontWnd.addEventListener('contextmenu', function (e) {
        const style = frontWnd.style;
        style.opacity = '0';
        style.display = 'none';
    });
    previewWnd.addEventListener('contextmenu', function (e) {
        const style = frontWnd.style;
        style.display = 'block';
        style.opacity = '0.95';
        frontWnd.innerHTML = document.getElementById('preview-window').innerHTML;
    });
}

function initMenuEvent(areaId, menuId) {

    const frame = document.getElementById(areaId);
    const menu = document.getElementById(menuId);

    frame.addEventListener('click', function (e) {
        menu.style.height = "0";
        menu.style.left = "-500px";
        menu.style.top = "-500px";
    });
    frame.addEventListener('contextmenu', function (e) {
        if (!touchedCssMenu) {
            menu.style.height = "0";
            menu.style.left = "-500px";
            menu.style.top = "-500px";
        } else {
            touchedCssMenu = false;
        }
    });
}

function initCssTree() {
    // addAdjacentHTML('css-frame', `
    // `);

    // const cssPropsList = document.getElementById('css-prop').children;
    // cssPropsList[0].classList.add('disabled');
    // cssPropsList[1].classList.add('disabled');
    disabledCssPropComponent(true);

    const rootName = 'css-rule';
    const id = 'css_0';
    addAdjacentHTML('css-tree', `
        <div class="node" id="${id}">
            <div class="col-indent" style="width: ${getIndentWidth(0)}px;"></div>
            <div class="col-operation"></div>
            <div class="col-element" onclick="selectCssNode(this)">
                <div class="root"><span>${rootName}</span></div>
            </div>
            <div class="col-param">
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
    `);

    const list = document.getElementById('css-tree').children;
    const element = list[0].children[2];

    addCssMenuOpenEvent(element);
}

function addCssMenuOpenEvent(element) {
    const menu = document.getElementById('css-menu');
    element.addEventListener('contextmenu', function (e) {
        menu.style.left = e.pageX + "px";
        menu.style.top = e.pageY + "px";
        menu.style.height = "206px";
        selectCssNode(element);
        initCssMenuEnable();
        touchedCssMenu = true;
    });
}

function initCssMenuEnable() {
    const list = document.getElementById('css-menu').children;
    const curNode = getSelectedElementForCssTree().parentNode;

    for (let i = 0; i < list.length; i++) {
        list[i].classList.remove('disabled');
    }

    for (let i = 0; i < list.length; i++) {
        const item = list[i];
        switch (item.innerHTML) {
            case 'Edit':
            case 'Remove self':
            case 'Remove self and child':
            case 'Cut':
            case 'Copy':
            case 'Insert parent':
                if (getLevelFromId(curNode.id) == 1) {
                    item.classList.add('disabled');
                }
                break;
            case 'Paste note':
                item.classList.add('disabled');
                break;
        }
    }
}


function editCss(obj) {

    const elTreeWnd = document.getElementById('css-tree');
    elTreeWnd.classList.add('disabled');

    disabledCssPropComponent(false);
}

function disabledCssPropComponent(flg) {
    const compList = document.getElementById('css-prop').children;
    if (flg) {
        compList[0].classList.add('disabled');
        compList[1].classList.add('disabled');
        compList[2].classList.add('disabled');
        compList[3].classList.add('disabled');
    } else {
        compList[0].classList.remove('disabled');
        compList[1].classList.remove('disabled');
        compList[2].classList.remove('disabled');
        compList[3].classList.remove('disabled');
    }
}

function editHtml(obj) {

    const elTreeWnd = document.getElementById('html-tree');
    elTreeWnd.classList.add('disabled');

    disabledHtmlPropComponent(false);
}

function disabledHtmlPropComponent(flg) {
    {
        const compList = document.getElementById('cont-property').children;
        if (flg) {
            compList[0].classList.add('disabled');
            compList[1].classList.add('disabled');
            compList[2].classList.add('disabled');
            compList[3].classList.add('disabled');
            compList[4].classList.add('disabled');
            compList[5].classList.add('disabled');
        } else {
            compList[0].classList.remove('disabled');
            compList[1].classList.remove('disabled');
            compList[2].classList.remove('disabled');
            compList[3].classList.remove('disabled');
            compList[4].classList.remove('disabled');
            compList[5].classList.remove('disabled');
        }
    }

    {
        const compList = document.getElementById('cont-text').children;
        if (flg) {
            compList[0].classList.add('disabled');
            compList[1].classList.add('disabled');
            compList[2].classList.add('disabled');
        } else {
            compList[0].classList.remove('disabled');
            compList[1].classList.remove('disabled');
            compList[2].classList.remove('disabled');
        }
    }
}

function addChildOnCssTree() {

    /* 選択中の要素のノードを取得 */
    const node = getSelectedElementForCssTree().parentNode;

    const level = getLevelFromId(node.id);
    const id = node.id + `-${getChildCnt(node) + 1}`;

    const elOpr = node.children[1];
    if (elOpr.children.length == 0) {
        elOpr.insertAdjacentHTML('beforeend', '<span onclick="openClose(this)">-</span>');
    } else {
        if (!isOpen(node.id)) {
            openClose(elOpr.children[0]);
        }
    }

    /* 自身の次の要素として挿入 */
    node.insertAdjacentHTML('afterend', `
        <div class="node" id="${id}">
            <div class="col-indent" style="width: ${getIndentWidth(level)}px;">
                <div style="width: ${getIndentWidth(level) - 20}px;"></div>
                <div class="line1"></div>
                <div class="line2"></div>
            </div>
            <div class="col-operation"></div>
            <div class="col-element" onclick="selectCssNode(this)">
                <div class="item create"><span>...</span></div>
            </div>
            <div class="col-param">
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
    `);

    const newNode = node.nextElementSibling;
    const target = newNode.children[2];
    addCssMenuOpenEvent(target);

    const props = newNode.children[3];
    const parentId = props.children[2];
    parentId.innerHTML = node.id;

    selectCssNode(target);

    updateIndentLine('css-tree');
    editCss();
}

function openClose(obj) {
    const val = obj.innerHTML;
    const id = obj.parentNode.parentNode.id;
    if (val == '-') {
        obj.innerHTML = '+';
        closeChildren(id);
    } else {
        obj.innerHTML = '-';
        openChildren(id);
    }
}

function openChildren(id) {

    const rootNode = document.getElementById(id).parentNode;
    const list = rootNode.children;
    for (let i = 1; i < list.length; i++) {
        const node = list[i];
        if (node.id == id) {
            continue;
        }
        /* 子孫である */
        const isProgeny = node.id.includes(id);
        /* 親要素が表示状態である */
        const isParentExist = getParent(node).style.display != 'none';
        /* 親要素がオープンしている */
        // alert(getParentId(node));
        const isParentOpen = isOpen(getParentId(node));
        if (isProgeny && isParentExist && isParentOpen) {
            //node.style.height = '35px';
            node.style.display = 'block';
        }
    }

    updateIndentLine(rootNode.id);
}

function getParentId(node) {
    return node.children[3].children[2].innerHTML;
}

function getParent(node) {
    return document.getElementById(getParentId(node));
}

function isOpen(nodeId) {
    const node = document.getElementById(nodeId);
    return node.children[1].children[0].innerHTML == '-';
}

function closeChildren(id) {

    const rootNode = document.getElementById(id).parentNode;
    const list = rootNode.children;
    for (let i = 1; i < list.length; i++) {
        const el = list[i];
        if (el.id != id && el.id.includes(id)) {
            el.style.display = 'none';
            //  el.style.height = '0';
            //  el.style.border = 'solid 0 #999';
        }
    }

    updateIndentLine(rootNode.id);
}

function updateIndentLine(treeId) {
    const list = document.getElementById(treeId).children;
    for (let i = 1; i < list.length; i++) {
        const curParentId = list[i].children[3].children[2].innerHTML;
        let lineSize = 18;
        let existCnt = 0;
        for (let j = i + 1; j < list.length; j++) {

            const targetParentId = getParentId(list[j]);
            if (isExistNode(list[j])) {
                existCnt++;
            }
            if (isExistNode(list[i]) && isExistNode(list[j]) && curParentId == targetParentId) {
                lineSize += (existCnt * 35);
                break;
            }
        }
        list[i].children[0].children[1].style.height = `${lineSize}px`;
    }
}

function isExistNode(node) {
    return node.style.display != 'none';
}


function getChildCnt(ownerNode) {
    const list = ownerNode.parentNode.children;

    let cnt = 0;
    for (let i = 0; i < list.length; i++) {
        const id = list[i].id;
        if (list[i] != ownerNode && id.includes(ownerNode.id)) {
            cnt++;
        }
    }
    return cnt
}

function getCssRuleNodeList() {
    return document.getElementById('css-tree').children;
}

function getLevelFromId(id) {
    const val = id.split('_')[1];
    return val.split('-').length;
}

function enterCss() {
    const selector = document.getElementById('css-selector').value;
    const property = document.getElementById('css-property').value;
    const cur = getSelectedElementForCssTree();
    cur.innerHTML = '';

    const items = selector.split(',');
    for (let i = 0; i < items.length; i++) {
        const item = items[i].trim();
        let type = 'tag';
        switch (item.substring(0, 1)) {
            case '.':
                type = 'class';
                break;
            case '#':
                type = 'id';
                break;
        }
        cur.insertAdjacentHTML('afterbegin', `
            <div class="item ${type}">
                <span>${item}</span>
            </div>
        `);
    }

    const elTreeWnd = document.getElementById('css-tree');
    elTreeWnd.classList.remove('disabled');
    disabledCssPropComponent(true);

    const props = getSelectedElementForCssTree().parentNode.children[3];

    props.children[0].innerHTML = selector;
    props.children[1].innerHTML = property;

    buildPreview();
}

function getSelectedElementForCssTree() {
    const list = document.getElementById('css-tree').children;
    for (let i = 0; i < list.length; i++) {
        const element = list[i].children[2];
        if (element.classList.contains('selected')) {
            return element;
        }
    }
    return null;
}

function getSelectedElementForHtmlTree() {
    const list = document.getElementById('html-tree').children;
    for (let i = 0; i < list.length; i++) {
        const element = list[i].children[2];
        if (element.classList.contains('selected')) {
            return element;
        }
    }
    return null;
}

function selectCssNode(obj) {
    const list = document.getElementById('css-tree').children;
    for (let i = 0; i < list.length; i++) {
        const element = list[i].children[2];
        element.classList.remove('selected');
    }
    obj.classList.add('selected');

    const props = obj.parentNode.children[3].children;

    const cssPropsList = document.getElementById('css-prop').children;
    const nameArea = cssPropsList[0];
    const propArea = cssPropsList[1];
    nameArea.value = props[0].innerHTML;
    propArea.value = props[1].innerHTML;

    //alert(`自分は${obj.parentNode.id}、親は${getParentId(obj.parentNode)}`);
}

function alertNodeInf(obj) {
    if (getLevelFromId(obj.parentNode.id) == 1) return;
    alert(`自身は${obj.parentNode.id}、親は${obj.parentNode.children[3].children[2].innerHTML}`);
}

function selectHtmlNode(obj) {
    const list = document.getElementById('html-tree').children;
    for (let i = 0; i < list.length; i++) {
        const element = list[i].children[2];
        element.classList.remove('selected');
    }
    obj.classList.add('selected');

    //alert(`自分は${obj.parentNode.id}、親は${getParentId(obj.parentNode)}`);
    if (!isTextContent(obj.parentNode)) {
        selectTab(document.getElementById('html-tab').children[0].children[0]);
        mappingHtmlProps(obj);
    } else {
        selectTab(document.getElementById('html-tab').children[0].children[1]);
        mappingTextContent(obj);
    }

}

function mappingHtmlProps(obj) {

    const props = obj.parentNode.children[3].children;

    const compList = document.getElementById('cont-property').children;
    const tagArea = compList[0];
    const idArea = compList[1];
    const classArea = compList[2].children[0];
    tagArea.value = props[0].innerHTML;

    const idClass = props[1].innerHTML.split('|');
    idArea.value = idClass[0];

    if(idClass.length >= 2) {
        classArea.value = idClass[1];
    } else {
        classArea.value = '';
    }
}

function mappingTextContent(obj) {

    const props = obj.parentNode.children[3].children;

    const compList = document.getElementById('cont-text').children;
    const textArea = compList[0];
    textArea.value = props[0].innerHTML;
}

function initHtmlTree() {
    disabledHtmlPropComponent(true);

    const rootName = 'html-body';
    const id = 'html_0';
    addAdjacentHTML('html-tree', `
        <div class="node" id="${id}">
            <div class="col-indent" style="width: ${getIndentWidth(0)}px;"></div>
            <div class="col-operation"></div>
            <div class="col-element" onclick="selectHtmlNode(this)">
                <div class="root"><span>${rootName}</span></div>
            </div>
            <div class="col-param">
                <div>body</div>
                <div></div>
                <div></div>
            </div>
        </div>
    `);

    const list = document.getElementById('html-tree').children;
    const element = list[0].children[2];

    addHtmlMenuOpenEvent(element);
}

function addHtmlMenuOpenEvent(element) {
    const menu = document.getElementById('html-menu');
    element.addEventListener('contextmenu', function (e) {
        menu.style.left = e.pageX + "px";
        menu.style.top = e.pageY + "px";
        menu.style.height = "252px";
        selectHtmlNode(element);
        initHtmlMenuEnable();
        touchedCssMenu = true;
    });
}


function initHtmlMenuEnable() {
    const list = document.getElementById('html-menu').children;
    const curNode = getSelectedElementForHtmlTree().parentNode;

    for (let i = 0; i < list.length; i++) {
        list[i].classList.remove('disabled');
    }

    for (let i = 0; i < list.length; i++) {
        const item = list[i];
        switch (item.innerHTML) {
            case 'Edit':
            case 'Remove self':
            case 'Remove self and child':
            case 'Cut':
            case 'Copy':
            case 'Insert parent':
                if (getLevelFromId(curNode.id) == 1) {
                    item.classList.add('disabled');
                }
                break;
            case 'Paste note':
                item.classList.add('disabled');
                break;
            case 'Add child':
                if (isTextContent(curNode)) {
                    item.classList.add('disabled');
                }
                break;

        }
    }
}

function isTextContent(node) {
    return node.children[2].children[0].classList.contains('text');
}

function addChildOnHtmlTree() {

    /* 選択中の要素のノードを取得 */
    const node = getSelectedElementForHtmlTree().parentNode;

    const level = getLevelFromId(node.id);
    const id = node.id + `-${getChildCnt(node) + 1}`;

    const elOpr = node.children[1];
    if (elOpr.children.length == 0) {
        elOpr.insertAdjacentHTML('beforeend', '<span onclick="openClose(this)">-</span>');
    } else {
        if (!isOpen(node.id)) {
            openClose(elOpr.children[0]);
        }
    }

    /* 自身の次の要素として挿入 */
    node.insertAdjacentHTML('afterend', `
        <div class="node" id="${id}">
            <div class="col-indent" style="width: ${getIndentWidth(level)}px;">
                <div style="width: ${getIndentWidth(level) - 20}px;"></div>
                <div class="line1"></div>
                <div class="line2"></div>
            </div>
            <div class="col-operation"></div>
            <div class="col-element" onclick="selectHtmlNode(this)">
                <div class="item tag"><span>div</span></div>
            </div>
            <div class="col-param">
                <div>div</div>
                <div></div>
                <div></div>
            </div>
        </div>
    `);

    const newNode = node.nextElementSibling;
    const target = newNode.children[2];
    addHtmlMenuOpenEvent(target);

    const props = newNode.children[3];
    const parentId = props.children[2];
    parentId.innerHTML = node.id;

    selectHtmlNode(target);
    updateIndentLine('html-tree');
    editHtml();
}

function addTextContent() {

    /* 選択中の要素のノードを取得 */
    const node = getSelectedElementForHtmlTree().parentNode;

    const level = getLevelFromId(node.id);
    const id = node.id + `-${getChildCnt(node) + 1}`;

    const elOpr = node.children[1];
    if (elOpr.children.length == 0) {
        elOpr.insertAdjacentHTML('beforeend', '<span onclick="openClose(this)">-</span>');
    } else {
        if (!isOpen(node.id)) {
            openClose(elOpr.children[0]);
        }
    }

    /* 自身の次の要素として挿入 */
    node.insertAdjacentHTML('afterend', `
        <div class="node" id="${id}">
            <div class="col-indent" style="width: ${getIndentWidth(level)}px;">
                <div style="width: ${getIndentWidth(level) - 20}px;"></div>
                <div class="line1"></div>
                <div class="line2"></div>
            </div>
            <div class="col-operation"></div>
            <div class="col-element" onclick="selectHtmlNode(this)">
                <div class="item text"><span>text content</span></div>
            </div>
            <div class="col-param">
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
    `);

    const newNode = node.nextElementSibling;
    const target = newNode.children[2];
    addHtmlMenuOpenEvent(target);

    const props = newNode.children[3];
    const parentId = props.children[2];
    parentId.innerHTML = node.id;

    selectHtmlNode(target);
    updateIndentLine('html-tree');
    editHtml();
}

function editHtml(obj) {

    const elTreeWnd = document.getElementById('html-tree');
    elTreeWnd.classList.add('disabled');

    disabledHtmlPropComponent(false);
}

function enterHtml() {
    const tagEl = document.getElementById('html-tag').value;
    const idEl = document.getElementById('html-id').value;
    const classEl = document.getElementById('html-class').children[0].value;
    const attrEl = document.getElementById('html-attr').children[0].value;
    const cur = getSelectedElementForHtmlTree();
    cur.innerHTML = '';

    let styleCode = '';
    if(idEl != '') {
        styleCode += `
            <span style="color: #000;">id="</span>
            ${idEl}
            <span style="color: #000;">"</span>`;
    }
    if(classEl != '') {
        styleCode += `
            <span style="color: #000;">class="</span>
            ${classEl.replace('\n',' ')}
            <span style="color: #000;">"</span>`;
    }
    cur.insertAdjacentHTML('beforeend', `
        <div class="item tag">
            <span>${tagEl}</span>
        </div>
    `);
    if (styleCode != '') {
        cur.insertAdjacentHTML('beforeend', `
            <div class="item style">
                <span>${styleCode}</span>
            </div>
        `);
    }

    const elTreeWnd = document.getElementById('html-tree');
    elTreeWnd.classList.remove('disabled');
    disabledHtmlPropComponent(true);

    const props = cur.parentNode.children[3];

    props.children[0].innerHTML = tagEl;
    props.children[1].innerHTML = idEl + '|' + classEl;

    buildPreview();
}


function enterText() {
    const textEl = document.getElementById('html-text').value;
    const cur = getSelectedElementForHtmlTree();

    const elTreeWnd = document.getElementById('html-tree');
    elTreeWnd.classList.remove('disabled');
    disabledHtmlPropComponent(true);

    const props = cur.parentNode.children[3];

    props.children[0].innerHTML = textEl;

    buildPreview();
}


function getIndentWidth(level) {
    return 10 + 30 * level;
}

function addAdjacentHTML(id, src) {
    let element = document.getElementById(id);
    element.insertAdjacentHTML('beforeend', src);
}


function setSelectTab(tabId, index) {
    const elTabList = document.getElementById(tabId).children[0];
    selectTab(elTabList.children[index]);
}

function selectTab(obj) {
    let base = obj.parentNode.parentNode;
    let tabs = base.children[0].children;
    let conts = base.children[1].children;
    let curIndex = -1;
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('tab-active');
        conts[i].classList.remove('cont-active');
        if (tabs[i] == obj) {
            curIndex = i;
        }
    }
    tabs[curIndex].classList.add('tab-active');
    conts[curIndex].classList.add('cont-active');
}

function removeCssChild() {
    const cur = getSelectedElementForCssTree().parentNode;
    const id = cur.id;
    const rootNode = cur.parentNode;
    const list = rootNode.children;
    for (let i = 1; i < list.length; i++) {
        const node = list[i];
        if (node.id == id) {
            continue;
        }
        /* 子孫である */
        const isProgeny = node.id.includes(id);
        if (isProgeny) {
            rootNode.removeChild(node);
        }
    }
}

function buildPreview() {
    
    const htmlNodeList = document.getElementById('html-tree').children;
    const cssNodeList = document.getElementById('css-tree').children;

    const preview = document.getElementById('preview-window');

    preview.innerHTML = '';

    const readList = [];
    for(let i = 1; i < htmlNodeList.length; i ++) {
    
        const node = htmlNodeList[i];
        if(readList.includes(node.id)) continue;

        buildHtmlRec(node, preview, readList, htmlNodeList);
    }

    const htmlSrc = document.getElementById('source-html');
    htmlSrc.innerHTML = `<p>${preview.innerHTML.replace(/</g,'&lt;').replace(/>/,'&gt;')}</p>`;

    let rules = '';
    for(let i = 1; i < cssNodeList.length; i ++) {
    
        const node = cssNodeList[i];
 
        const selector = getSelectorRec(node.children[3].children[0].innerHTML, node);
        const property = node.children[3].children[1].innerHTML;

        let rule = selector + ' {';
        rule += property.replace('\n', ' ');
        rule += '}\n';
        addCssRule('#preview-window>' + rule);

        rules += rule + '<br>';
    }
    const cssSrc = document.getElementById('source-css');
    cssSrc.innerHTML = `<p>${rules}</p>`;

}

function getSelectorRec(str, node) {
    let result = str;
    const parentId = node.children[3].children[2].innerHTML;
    if(parentId != 'css_0') {
        const parentSelector = document.getElementById(parentId).children[3].children[0].innerHTML;
        result = parentSelector + '>' + str;
    }
    return result;
}

function buildHtmlRec(node, parent, readList, htmlNodeList) {
    readList.push(node.id);
    const paramEl = node.children[3];
    const tagName = paramEl.children[0].innerHTML;

    if(!isTextContent(node)) {
        const prop = paramEl.children[1].innerHTML;
        let styleCode = '';
        if(prop != '') {
            let idClass = prop.split('|');
            let idName = idClass[0];
            let classNames = idClass[1].replace('\n', ' ');

            if(idName != '') {
                styleCode += ` id="${idName}"`;
            }
            if(classNames != '') {
                styleCode += ` class="${classNames}"`;
            }
        }

        parent.insertAdjacentHTML('beforeend', `<${tagName}${styleCode}></${tagName}>`);

        const innerEl = parent.children[0];

        for(let i = 1; i < htmlNodeList.length; i ++) {
            const child = htmlNodeList[i];

            if(child.id == node.id || readList.includes(child.id)) continue;
            /* 子孫である */
            const isProgeny = child.id.includes(node.id);

            if(isProgeny) {
                buildHtmlRec(child, innerEl, readList, htmlNodeList);
            }
        }
    } else {
        const text = paramEl.children[0].innerHTML;
        parent.insertAdjacentHTML('beforeend', text);
    }

}

function initStyle() {
    let tag = document.createElement('style');
    tag.type = "text/css";
    document.getElementsByTagName('head').item(0).appendChild(tag);
}

function addCssRule(code) {
    let stylesheet = getStyle(0);
    stylesheet.insertRule(code, stylesheet.cssRules.length);
}

function getStyle() {
    return document.styleSheets.item(document.styleSheets.length - 1);
}
