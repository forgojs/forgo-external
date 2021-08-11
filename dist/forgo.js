/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/forgo/dist/index.js":
/*!******************************************!*\
  !*** ./node_modules/forgo/dist/index.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.setForgoState = exports.getForgoState = exports.rerender = exports.render = exports.mount = exports.setCustomEnv = exports.createForgoInstance = exports.h = exports.createElement = exports.Fragment = void 0;
/*
  Fragment constructor.
  We simply use it as a marker in jsx-runtime.
*/
exports.Fragment = Symbol("FORGO_FRAGMENT");
/*
  Namespaces
*/
const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
const MATH_NAMESPACE = "http://www.w3.org/1998/Math/MathML";
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
/*
  The element types we care about.
  As defined by the standards.
*/
const ELEMENT_NODE_TYPE = 1;
const ATTRIBUTE_NODE_TYPE = 2;
const TEXT_NODE_TYPE = 3;
/*
  jsxFactory function
*/
function createElement(type, props) {
    var _a;
    props = props !== null && props !== void 0 ? props : {};
    props.children =
        arguments.length > 3
            ? Array.from(arguments).slice(2)
            : arguments.length === 3
                ? [arguments[2]]
                : undefined;
    const key = (_a = props.key) !== null && _a !== void 0 ? _a : undefined;
    return { type, props, key, __is_forgo_element__: true };
}
exports.createElement = createElement;
exports.h = createElement;
/*
  HACK: Chrome fires onblur (if defined) immediately after a node.remove().
  This is bad news for us, since a rerender() inside the onblur handler will run on an unattached node.
  So, disable onblur if node is set to be removed.
*/
function handlerDisabledOnNodeDelete(node, value) {
    return (e) => {
        if (!node.__forgo_deleted) {
            return value(e);
        }
    };
}
function createForgoInstance(customEnv) {
    var _a;
    const env = customEnv;
    env.__internal = (_a = env.__internal) !== null && _a !== void 0 ? _a : {
        Text: env.window.Text,
        HTMLElement: env.window.HTMLElement,
    };
    /*
      This is the main render function.
      forgoNode is the node to render.
    
      nodeInsertionOptions specify which nodes need to be replaced by the new node(s),
      or whether the new node should be created detached from the DOM (without replacement).
  
      pendingAttachStates is the list of Component State objects which will be attached to the element.
    */
    function internalRender(forgoNode, nodeInsertionOptions, pendingAttachStates) {
        // Array of Nodes
        if (Array.isArray(forgoNode)) {
            return renderArray(forgoNode, nodeInsertionOptions, pendingAttachStates);
        }
        // Primitive Nodes
        else if (!isForgoElement(forgoNode)) {
            return forgoNode === undefined || forgoNode === null
                ? { nodes: [] }
                : renderText(forgoNode, nodeInsertionOptions, pendingAttachStates);
        }
        // HTML Element
        else if (isForgoDOMElement(forgoNode)) {
            return renderDOMElement(forgoNode, nodeInsertionOptions, pendingAttachStates);
        }
        else if (isForgoFragment(forgoNode)) {
            return renderFragment(forgoNode, nodeInsertionOptions, pendingAttachStates);
        }
        // Custom Component.
        else {
            return renderCustomComponent(forgoNode, nodeInsertionOptions, pendingAttachStates);
        }
    }
    /*
      Render a string.
    
      Such as in the render function below:
      function MyComponent() {
        return {
          render() {
            return "Hello world"
          }
        }
      }
    */
    function renderText(forgoNode, nodeInsertionOptions, pendingAttachStates) {
        // We need to create a detached node
        if (nodeInsertionOptions.type === "detached") {
            // Text nodes will always be recreated
            const textNode = env.document.createTextNode(stringOfPrimitiveNode(forgoNode));
            syncStateAndProps(forgoNode, textNode, textNode, pendingAttachStates);
            return { nodes: [textNode] };
        }
        // We have to find a node to replace.
        else {
            // Text nodes will always be recreated
            const textNode = env.document.createTextNode(stringOfPrimitiveNode(forgoNode));
            // If we're searching in a list, we replace if the current node is a text node.
            const childNodes = nodeInsertionOptions.parentElement.childNodes;
            if (nodeInsertionOptions.length) {
                let targetNode = childNodes[nodeInsertionOptions.currentNodeIndex];
                if (targetNode.nodeType === TEXT_NODE_TYPE) {
                    targetNode.replaceWith(textNode);
                    syncStateAndProps(forgoNode, textNode, targetNode, pendingAttachStates);
                    return { nodes: [textNode] };
                }
                else {
                    const nextNode = childNodes[nodeInsertionOptions.currentNodeIndex];
                    nodeInsertionOptions.parentElement.insertBefore(textNode, nextNode);
                    syncStateAndProps(forgoNode, textNode, textNode, pendingAttachStates);
                    return { nodes: [textNode] };
                }
            }
            // There are no target nodes available
            else {
                const childNodes = nodeInsertionOptions.parentElement.childNodes;
                if (childNodes.length === 0 ||
                    nodeInsertionOptions.currentNodeIndex === 0) {
                    nodeInsertionOptions.parentElement.prepend(textNode);
                }
                else {
                    const nextNode = childNodes[nodeInsertionOptions.currentNodeIndex];
                    nodeInsertionOptions.parentElement.insertBefore(textNode, nextNode);
                }
                syncStateAndProps(forgoNode, textNode, textNode, pendingAttachStates);
                return { nodes: [textNode] };
            }
        }
    }
    /*
      Render a DOM element.
    
      Such as in the render function below:
      function MyComponent() {
        return {
          render() {
            return <div>Hello world</div>
          }
        }
      }
    */
    function renderDOMElement(forgoElement, nodeInsertionOptions, pendingAttachStates) {
        // We need to create a detached node
        if (nodeInsertionOptions.type === "detached") {
            const newElement = addNewDOMElement(undefined, null);
            return { nodes: [newElement] };
        }
        // We have to find a node to replace.
        else {
            const childNodes = nodeInsertionOptions.parentElement.childNodes;
            if (nodeInsertionOptions.length) {
                const searchResult = findReplacementCandidateForDOMElement(forgoElement, childNodes, nodeInsertionOptions.currentNodeIndex, nodeInsertionOptions.length);
                if (searchResult.found) {
                    // Get rid of unwanted nodes.
                    unloadNodes(sliceDOMNodes(childNodes, nodeInsertionOptions.currentNodeIndex, searchResult.index), pendingAttachStates);
                    const targetElement = childNodes[nodeInsertionOptions.currentNodeIndex];
                    renderDOMChildNodes(targetElement);
                    syncStateAndProps(forgoElement, targetElement, targetElement, pendingAttachStates);
                    return { nodes: [targetElement] };
                }
                else {
                    const newElement = addNewDOMElement(nodeInsertionOptions.parentElement, childNodes[nodeInsertionOptions.currentNodeIndex]);
                    return { nodes: [newElement] };
                }
            }
            else {
                const newElement = addNewDOMElement(nodeInsertionOptions.parentElement, childNodes[nodeInsertionOptions.currentNodeIndex]);
                return { nodes: [newElement] };
            }
        }
        function renderDOMChildNodes(parentElement) {
            if (forgoElement.props.dangerouslySetInnerHTML) {
                parentElement.innerHTML =
                    forgoElement.props.dangerouslySetInnerHTML.__html;
            }
            else {
                const forgoChildrenObj = forgoElement.props.children;
                // Children will not be an array if single item
                const forgoChildren = flatten((Array.isArray(forgoChildrenObj)
                    ? forgoChildrenObj
                    : [forgoChildrenObj]).filter((x) => x !== undefined && x !== null));
                let currentChildNodeIndex = 0;
                for (const forgoChild of forgoChildren) {
                    const { nodes } = internalRender(forgoChild, {
                        type: "search",
                        parentElement,
                        currentNodeIndex: currentChildNodeIndex,
                        length: parentElement.childNodes.length - currentChildNodeIndex,
                    }, []);
                    currentChildNodeIndex += nodes.length;
                }
                // Get rid the the remaining nodes
                const nodesToRemove = sliceDOMNodes(parentElement.childNodes, currentChildNodeIndex, parentElement.childNodes.length);
                if (nodesToRemove.length) {
                    unloadNodes(nodesToRemove, []);
                }
            }
        }
        function addNewDOMElement(parentElement, oldNode) {
            const newElement = createElement(forgoElement, parentElement);
            if (parentElement) {
                parentElement.insertBefore(newElement, oldNode);
            }
            if (forgoElement.props.ref) {
                forgoElement.props.ref.value = newElement;
            }
            renderDOMChildNodes(newElement);
            syncStateAndProps(forgoElement, newElement, newElement, pendingAttachStates);
            return newElement;
        }
    }
    /*
      Render a Custom Component
      Such as <MySideBar size="large" />
    */
    function renderCustomComponent(forgoElement, nodeInsertionOptions, pendingAttachStates
    // boundary: ForgoComponent<any> | undefined
    ) {
        const componentIndex = pendingAttachStates.length;
        // We need to create a detached node
        if (nodeInsertionOptions.type === "detached") {
            return addNewComponent();
        }
        // We have to find a node to replace.
        else {
            if (nodeInsertionOptions.length) {
                const childNodes = nodeInsertionOptions.parentElement.childNodes;
                const searchResult = findReplacementCandidateForCustomComponent(forgoElement, childNodes, nodeInsertionOptions.currentNodeIndex, nodeInsertionOptions.length, pendingAttachStates.length);
                if (searchResult.found) {
                    const targetNode = childNodes[searchResult.index];
                    const state = getExistingForgoState(targetNode);
                    const componentState = state.components[componentIndex];
                    // Get rid of unwanted nodes.
                    unloadNodes(sliceDOMNodes(childNodes, nodeInsertionOptions.currentNodeIndex, searchResult.index), pendingAttachStates.concat(componentState));
                    return renderExistingComponent(nodeInsertionOptions, componentState);
                }
                // No matching node found
                else {
                    return addNewComponent();
                }
            }
            // No nodes in target node list
            else {
                return addNewComponent();
            }
        }
        function renderExistingComponent(nodeInsertionOptions, componentState) {
            if (!componentState.component.shouldUpdate ||
                componentState.component.shouldUpdate(forgoElement.props, componentState.props)) {
                // Since we have compatible state already stored,
                // we'll push the savedComponentState into pending states for later attachment.
                const newComponentState = Object.assign(Object.assign({}, componentState), { props: forgoElement.props });
                const statesToAttach = pendingAttachStates.concat(newComponentState);
                const previousNode = componentState.args.element.node;
                // Get a new element by calling render on existing component.
                const newForgoNode = newComponentState.component.render(forgoElement.props, newComponentState.args);
                const boundary = newComponentState.component.error
                    ? newComponentState.component
                    : undefined;
                const renderResult = withErrorBoundary(forgoElement.props, newComponentState.args, statesToAttach, boundary, () => {
                    // Create new node insertion options.
                    const insertionOptions = {
                        type: "search",
                        currentNodeIndex: nodeInsertionOptions.currentNodeIndex,
                        length: newComponentState.nodes.length,
                        parentElement: nodeInsertionOptions.parentElement,
                    };
                    return renderComponentAndRemoveStaleNodes(newForgoNode, insertionOptions, statesToAttach, newComponentState);
                });
                if (newComponentState.component.afterRender) {
                    newComponentState.component.afterRender(forgoElement.props, Object.assign(Object.assign({}, newComponentState.args), { previousNode }));
                }
                return renderResult;
            }
            // shouldUpdate() returned false
            else {
                let indexOfNode = findDOMNodeIndex(nodeInsertionOptions.parentElement.childNodes, componentState.args.element.node);
                return {
                    nodes: sliceDOMNodes(nodeInsertionOptions.parentElement.childNodes, indexOfNode, indexOfNode + componentState.nodes.length),
                };
            }
        }
        function addNewComponent() {
            const args = {
                element: { componentIndex },
                update: (props) => rerender(args.element, props),
            };
            const ctor = forgoElement.type;
            const component = ctor(forgoElement.props, { environment: env });
            assertIsComponent(ctor, component);
            const boundary = component.error ? component : undefined;
            // Create new component state
            // ... and push it to pendingAttachStates
            const newComponentState = {
                key: forgoElement.key,
                ctor,
                component,
                props: forgoElement.props,
                args,
                nodes: [],
                isMounted: false,
            };
            const statesToAttach = pendingAttachStates.concat(newComponentState);
            return withErrorBoundary(forgoElement.props, args, statesToAttach, boundary, () => {
                // Create an element by rendering the component
                const newForgoElement = component.render(forgoElement.props, args);
                // Create new node insertion options.
                const insertionOptions = nodeInsertionOptions.type === "detached"
                    ? nodeInsertionOptions
                    : {
                        type: "search",
                        currentNodeIndex: nodeInsertionOptions.currentNodeIndex,
                        length: 0,
                        parentElement: nodeInsertionOptions.parentElement,
                    };
                // Pass it on for rendering...
                const renderResult = internalRender(newForgoElement, insertionOptions, statesToAttach);
                // In case we rendered an array, set the node to the first node.
                // We do this because args.element.node would be set to the last node otherwise.
                newComponentState.nodes = renderResult.nodes;
                if (renderResult.nodes.length > 1) {
                    newComponentState.args.element.node = renderResult.nodes[0];
                }
                if (component.afterRender) {
                    // No previousNode since new component. So just args and not afterRenderArgs.
                    component.afterRender(forgoElement.props, args);
                }
                return renderResult;
            });
        }
        function withErrorBoundary(props, args, statesToAttach, boundary, exec) {
            try {
                return exec();
            }
            catch (error) {
                if (boundary && boundary.error) {
                    const errorArgs = Object.assign(Object.assign({}, args), { error });
                    const newForgoElement = boundary.error(props, errorArgs);
                    return internalRender(newForgoElement, nodeInsertionOptions, statesToAttach);
                }
                else {
                    throw error;
                }
            }
        }
    }
    function renderComponentAndRemoveStaleNodes(forgoNode, insertionOptions, statesToAttach, componentState) {
        const totalNodesBeforeRender = insertionOptions.parentElement.childNodes.length;
        // Pass it on for rendering...
        const renderResult = internalRender(forgoNode, insertionOptions, statesToAttach);
        const totalNodesAfterRender = insertionOptions.parentElement.childNodes.length;
        const numNodesRemoved = totalNodesBeforeRender +
            renderResult.nodes.length -
            totalNodesAfterRender;
        const newIndex = insertionOptions.currentNodeIndex + renderResult.nodes.length;
        const nodesToRemove = sliceDOMNodes(insertionOptions.parentElement.childNodes, newIndex, newIndex + componentState.nodes.length - numNodesRemoved);
        unloadNodes(nodesToRemove, statesToAttach);
        // In case we rendered an array, set the node to the first node.
        // We do this because args.element.node would be set to the last node otherwise.
        componentState.nodes = renderResult.nodes;
        if (renderResult.nodes.length > 1) {
            componentState.args.element.node = renderResult.nodes[0];
        }
        return renderResult;
    }
    /*
      Render an array of components
      Called when a CustomComponent returns an array (or fragment) in its render method.
    */
    function renderArray(forgoNodes, nodeInsertionOptions, pendingAttachStates) {
        const flattenedNodes = flatten(forgoNodes);
        if (nodeInsertionOptions.type === "detached") {
            throw new Error("Arrays and fragments cannot be rendered at the top level.");
        }
        else {
            let allNodes = [];
            let currentNodeIndex = nodeInsertionOptions.currentNodeIndex;
            let numNodes = nodeInsertionOptions.length;
            for (const forgoNode of flattenedNodes) {
                const totalNodesBeforeRender = nodeInsertionOptions.parentElement.childNodes.length;
                const insertionOptions = Object.assign(Object.assign({}, nodeInsertionOptions), { currentNodeIndex, length: numNodes });
                const { nodes } = internalRender(forgoNode, insertionOptions, pendingAttachStates);
                allNodes = allNodes.concat(nodes);
                const totalNodesAfterRender = nodeInsertionOptions.parentElement.childNodes.length;
                const numNodesRemoved = totalNodesBeforeRender + nodes.length - totalNodesAfterRender;
                currentNodeIndex += nodes.length;
                numNodes -= numNodesRemoved;
            }
            return { nodes: allNodes };
        }
    }
    /*
      Render a Fragment
    */
    function renderFragment(fragment, nodeInsertionOptions, pendingAttachStates) {
        return renderArray(flatten(fragment), nodeInsertionOptions, pendingAttachStates);
    }
    /*
      Sync component states and props between a newNode and an oldNode.
    */
    function syncStateAndProps(forgoNode, newNode, targetNode, pendingAttachStates) {
        var _a;
        // We have to get oldStates before attachProps;
        // coz attachProps will overwrite with new states.
        const oldComponentStates = (_a = getForgoState(targetNode)) === null || _a === void 0 ? void 0 : _a.components;
        attachProps(forgoNode, newNode, pendingAttachStates);
        if (oldComponentStates) {
            const indexOfFirstIncompatibleState = findIndexOfFirstIncompatibleState(pendingAttachStates, oldComponentStates);
            unmountComponents(oldComponentStates, indexOfFirstIncompatibleState);
            mountComponents(pendingAttachStates, indexOfFirstIncompatibleState);
        }
        else {
            mountComponents(pendingAttachStates, 0);
        }
    }
    /*
      Unloads components from a node list
      This does:
      a) Remove the node
      b) Calls unload on all attached components
    */
    function unloadNodes(nodes, pendingAttachStates) {
        for (const node of nodes) {
            node.__forgo_deleted = true;
            node.remove();
            const state = getForgoState(node);
            if (state) {
                const oldComponentStates = state.components;
                const indexOfFirstIncompatibleState = findIndexOfFirstIncompatibleState(pendingAttachStates, oldComponentStates);
                unmountComponents(state.components, indexOfFirstIncompatibleState);
            }
        }
    }
    /*
      When states are attached to a new node or when states are reattached,
      some of the old component states need to go away.
      The corresponding components will need to be unmounted.
  
      While rendering, the component gets reused if the ctor is the same.
      If the ctor is different, the component is discarded. And hence needs to be unmounted.
      So we check the ctor type in old and new.
    */
    function findIndexOfFirstIncompatibleState(newStates, oldStates) {
        let i = 0;
        for (const newState of newStates) {
            if (oldStates.length > i) {
                const oldState = oldStates[i];
                if (oldState.component !== newState.component) {
                    break;
                }
                i++;
            }
            else {
                break;
            }
        }
        return i;
    }
    /*
      Unmount components above an index. This is going to be passed a stale state[].
      The from param is the index at which stale state[] differs from new state[]
    */
    function unmountComponents(states, from) {
        // If the parent has already unmounted, we can skip checks on children.
        let parentHasUnmounted = false;
        for (let i = from; i < states.length; i++) {
            const state = states[i];
            if (state.component.unmount) {
                // Render if:
                //  - parent has already unmounted
                //  - OR for all nodes:
                //  -   node is disconnected
                //  -   OR node connected to a different component
                if (parentHasUnmounted ||
                    state.nodes.every((x) => {
                        if (!x.isConnected) {
                            return true;
                        }
                        else {
                            const componentState = getExistingForgoState(x);
                            return (!componentState.components[i] ||
                                componentState.components[i].component !== state.component);
                        }
                    })) {
                    state.component.unmount(state.props, state.args);
                    parentHasUnmounted = true;
                }
            }
        }
    }
    /*
      Mount components above an index. This is going to be passed the new state[].
      The from param is the index at which stale state[] differs from new state[]
    */
    function mountComponents(states, from) {
        for (let i = from; i < states.length; i++) {
            const state = states[i];
            if (state.component.mount && !state.isMounted) {
                state.isMounted = true;
                state.component.mount(state.props, state.args);
            }
        }
    }
    /*
      When we try to find replacement candidates for DOM nodes,
      we try to:
        a) match by the key
        b) match by the tagname
    */
    function findReplacementCandidateForDOMElement(forgoElement, nodes, searchFrom, length) {
        for (let i = searchFrom; i < searchFrom + length; i++) {
            const node = nodes[i];
            const stateOnNode = getForgoState(node);
            if (forgoElement.key) {
                if ((stateOnNode === null || stateOnNode === void 0 ? void 0 : stateOnNode.key) === forgoElement.key) {
                    return { found: true, index: i };
                }
            }
            else {
                if (node.nodeType === ELEMENT_NODE_TYPE) {
                    const element = node;
                    // If the candidate has a key defined,
                    //  we don't match it with an unkeyed forgo element
                    if (element.tagName.toLowerCase() === forgoElement.type &&
                        (!stateOnNode || !stateOnNode.key)) {
                        return { found: true, index: i };
                    }
                }
            }
        }
        return { found: false };
    }
    /*
      When we try to find replacement candidates for Custom Components,
      we try to:
        a) match by the key
        b) match by the component constructor
    */
    function findReplacementCandidateForCustomComponent(forgoElement, nodes, searchFrom, length, componentIndex) {
        for (let i = searchFrom; i < searchFrom + length; i++) {
            const node = nodes[i];
            const stateOnNode = getForgoState(node);
            if (stateOnNode && stateOnNode.components.length > componentIndex) {
                if (forgoElement.key) {
                    if (stateOnNode.components[componentIndex].key === forgoElement.key) {
                        return { found: true, index: i };
                    }
                }
                else {
                    if (stateOnNode.components[componentIndex].ctor === forgoElement.type) {
                        return { found: true, index: i };
                    }
                }
            }
        }
        return { found: false };
    }
    /*
      Attach props from the forgoElement on to the DOM node.
      We also need to attach states from pendingAttachStates
    */
    function attachProps(forgoNode, node, pendingAttachStates) {
        // Capture previous nodes if afterRender is defined;
        const previousNodes = [];
        // We have to inject node into the args object.
        // components are already holding a reference to the args object.
        // They don't know yet that args.element.node is undefined.
        for (const state of pendingAttachStates) {
            previousNodes.push(state.component.afterRender ? state.args.element.node : undefined);
            state.args.element.node = node;
        }
        if (isForgoElement(forgoNode)) {
            const currentState = getForgoState(node);
            // Remove props which don't exist
            if (currentState && currentState.props) {
                for (const key in currentState.props) {
                    if (!(key in forgoNode.props)) {
                        if (key !== "children" && key !== "xmlns") {
                            if (node.nodeType === TEXT_NODE_TYPE) {
                                delete node[key];
                            }
                            else if (node instanceof env.__internal.HTMLElement) {
                                if (node.hasAttribute(key)) {
                                    node.removeAttribute(key);
                                }
                                else {
                                    delete node[key];
                                }
                            }
                            else {
                                node.removeAttribute(key);
                            }
                        }
                    }
                }
            }
            // TODO: What preact does to figure out attr vs prop
            //  - do a (key in element) check.
            const entries = Object.entries(forgoNode.props);
            for (const [key, value] of entries) {
                if (key !== "children" && key !== "xmlns") {
                    if (node.nodeType === TEXT_NODE_TYPE) {
                        node[key] = value;
                    }
                    else if (node instanceof env.__internal.HTMLElement) {
                        if (key === "style") {
                            // Optimization: many times in CSS to JS, style objects are re-used.
                            // If they're the same, skip the expensive styleToString() call.
                            if (currentState === undefined ||
                                currentState.style === undefined ||
                                currentState.style !== forgoNode.props.style) {
                                const stringOfCSS = styleToString(forgoNode.props.style);
                                if (node.style.cssText !== stringOfCSS) {
                                    node.style.cssText = stringOfCSS;
                                }
                            }
                        }
                        // This optimization is copied from preact.
                        else if (typeof value === "string" &&
                            (key.startsWith("aria-") || key.startsWith("data-"))) {
                            node.setAttribute(key, value);
                        }
                        else if (key === "onblur") {
                            node[key] = handlerDisabledOnNodeDelete(node, value);
                        }
                        else {
                            node[key] = value;
                        }
                    }
                    else {
                        if (typeof value === "string") {
                            node.setAttribute(key, value);
                        }
                        else {
                            node[key] = value;
                        }
                    }
                }
            }
            // Now attach the internal forgo state.
            const state = {
                key: forgoNode.key,
                props: forgoNode.props,
                components: pendingAttachStates,
            };
            setForgoState(node, state);
        }
        else {
            // Now attach the internal forgo state.
            const state = {
                components: pendingAttachStates,
            };
            setForgoState(node, state);
        }
    }
    /*
      Mount will render the DOM as a child of the specified container element.
    */
    function mount(forgoNode, container) {
        let parentElement = (isString(container)
            ? env.document.querySelector(container)
            : container);
        if (parentElement) {
            if (parentElement.nodeType === ELEMENT_NODE_TYPE) {
                return internalRender(forgoNode, {
                    type: "search",
                    currentNodeIndex: 0,
                    length: 0,
                    parentElement,
                }, []);
            }
            else {
                throw new Error("The container argument to the mount() function should be an HTML element.");
            }
        }
        else {
            throw new Error(`The mount() function was called on a non-element (${typeof container === "string" ? container : container === null || container === void 0 ? void 0 : container.tagName}).`);
        }
    }
    /*
      This render function returns the rendered dom node.
      forgoNode is the node to render.
    */
    function render(forgoNode) {
        const renderResult = internalRender(forgoNode, {
            type: "detached",
        }, []);
        return { node: renderResult.nodes[0], nodes: renderResult.nodes };
    }
    /*
      Code inside a component will call rerender whenever it wants to rerender.
      The following function is what they'll need to call.
  
      Given only a DOM element, how do we know what component to render?
      We'll fetch all that information from the state information stored on the element.
  
      This is attached to a node inside a NodeAttachedState structure.
    */
    function rerender(element, props) {
        if (element && element.node) {
            const parentElement = element.node.parentElement;
            if (parentElement !== null) {
                const state = getForgoState(element.node);
                if (state) {
                    const originalComponentState = state.components[element.componentIndex];
                    const effectiveProps = props !== undefined ? props : originalComponentState.props;
                    if (!originalComponentState.component.shouldUpdate ||
                        originalComponentState.component.shouldUpdate(effectiveProps, originalComponentState.props)) {
                        const newComponentState = Object.assign(Object.assign({}, originalComponentState), { props: effectiveProps });
                        const parentStates = state.components.slice(0, element.componentIndex);
                        const statesToAttach = parentStates.concat(newComponentState);
                        const previousNode = originalComponentState.args.element.node;
                        const forgoNode = originalComponentState.component.render(effectiveProps, originalComponentState.args);
                        let nodeIndex = findDOMNodeIndex(parentElement.childNodes, element.node);
                        const insertionOptions = {
                            type: "search",
                            currentNodeIndex: nodeIndex,
                            length: originalComponentState.nodes.length,
                            parentElement,
                        };
                        const renderResult = renderComponentAndRemoveStaleNodes(forgoNode, insertionOptions, statesToAttach, newComponentState);
                        // We have to propagate node changes up the tree.
                        for (let i = 0; i < parentStates.length; i++) {
                            const parentState = parentStates[i];
                            const indexOfOriginalRootNode = parentState.nodes.findIndex((x) => x === originalComponentState.nodes[0]);
                            // Let's recreate the node list.
                            parentState.nodes = parentState.nodes
                                // 1. all the nodes before first node associated with rendered component.
                                .slice(0, indexOfOriginalRootNode)
                                // 2. newly created nodes.
                                .concat(renderResult.nodes)
                                // 3. nodes after last node associated with rendered component.
                                .concat(parentState.nodes.slice(indexOfOriginalRootNode +
                                originalComponentState.nodes.length));
                            // If there are no nodes, call unmount on it (and child states)
                            if (parentState.nodes.length === 0) {
                                unmountComponents(parentStates, i);
                                break;
                            }
                            else {
                                // The root node might have changed, so fix it up anyway.
                                parentState.args.element.node = parentState.nodes[0];
                            }
                        }
                        // Unmount rendered component itself if all nodes are gone.
                        if (renderResult.nodes.length === 0) {
                            unmountComponents([newComponentState], 0);
                        }
                        // Run afterRender() if defined.
                        if (originalComponentState.component.afterRender) {
                            originalComponentState.component.afterRender(effectiveProps, Object.assign(Object.assign({}, originalComponentState.args), { previousNode }));
                        }
                        return renderResult;
                    }
                    // shouldUpdate() returned false
                    else {
                        let indexOfNode = findDOMNodeIndex(parentElement.childNodes, element.node);
                        return {
                            nodes: sliceDOMNodes(parentElement.childNodes, indexOfNode, indexOfNode + originalComponentState.nodes.length),
                        };
                    }
                }
                else {
                    throw new Error(`Missing forgo state on node.`);
                }
            }
            else {
                throw new Error(`The rerender() function was called on a node without a parent element.`);
            }
        }
        else {
            throw new Error(`Missing node information in rerender() argument.`);
        }
    }
    function createElement(forgoElement, parentElement) {
        var _a;
        const namespaceURI = ((_a = forgoElement.props.xmlns) !== null && _a !== void 0 ? _a : forgoElement.type === "svg")
            ? SVG_NAMESPACE
            : parentElement && parentElement.namespaceURI;
        if (forgoElement.props.is) {
            return namespaceURI
                ? env.document.createElementNS(namespaceURI, forgoElement.type, {
                    is: forgoElement.props.is,
                })
                : env.document.createElement(forgoElement.type, {
                    is: forgoElement.props.is,
                });
        }
        else {
            return namespaceURI
                ? env.document.createElementNS(namespaceURI, forgoElement.type)
                : env.document.createElement(forgoElement.type);
        }
    }
    return {
        mount,
        render,
        rerender,
    };
}
exports.createForgoInstance = createForgoInstance;
const windowObject = globalThis ? globalThis : window;
let forgoInstance = createForgoInstance({
    window: windowObject,
    document: windowObject.document,
});
function setCustomEnv(customEnv) {
    forgoInstance = createForgoInstance(customEnv);
}
exports.setCustomEnv = setCustomEnv;
function mount(forgoNode, container) {
    return forgoInstance.mount(forgoNode, container);
}
exports.mount = mount;
function render(forgoNode) {
    return forgoInstance.render(forgoNode);
}
exports.render = render;
function rerender(element, props) {
    return forgoInstance.rerender(element, props);
}
exports.rerender = rerender;
/*
  This recursively flattens an array or a Fragment.
  Fragments are treated as arrays, with the children prop being array items.
*/
function flatten(itemOrItems, ret = []) {
    const items = Array.isArray(itemOrItems)
        ? itemOrItems
        : isForgoFragment(itemOrItems)
            ? Array.isArray(itemOrItems.props.children)
                ? itemOrItems.props.children
                : itemOrItems.props.children !== undefined &&
                    itemOrItems.props.children !== null
                    ? [itemOrItems.props.children]
                    : []
            : [itemOrItems];
    for (const entry of items) {
        if (Array.isArray(entry) || isForgoFragment(entry)) {
            flatten(entry, ret);
        }
        else {
            ret.push(entry);
        }
    }
    return ret;
}
/*
  ForgoNodes can be primitive types.
  Convert all primitive types to their string representation.
*/
function stringOfPrimitiveNode(node) {
    return node.toString();
}
/*
  Get Node Types
*/
function isForgoElement(forgoNode) {
    return (forgoNode !== undefined &&
        forgoNode !== null &&
        forgoNode.__is_forgo_element__ === true);
}
function isForgoDOMElement(node) {
    return isForgoElement(node) && typeof node.type === "string";
}
function isForgoFragment(node) {
    return node !== undefined && node !== null && node.type === exports.Fragment;
}
/*
  Get the state (NodeAttachedState) saved into an element.
*/
function getForgoState(node) {
    return node.__forgo;
}
exports.getForgoState = getForgoState;
/*
  Same as above, but throws if undefined. (Caller must make sure.)
*/
function getExistingForgoState(node) {
    if (node.__forgo) {
        return node.__forgo;
    }
    else {
        throw new Error("Missing state in node.");
    }
}
/*
  Sets the state (NodeAttachedState) on an element.
*/
function setForgoState(node, state) {
    node.__forgo = state;
}
exports.setForgoState = setForgoState;
/*
  Throw if component is a non-component
*/
function assertIsComponent(ctor, component) {
    if (!component.render) {
        throw new Error(`${ctor.name || "Unnamed"} component constructor must return an object having a render() function.`);
    }
}
function isString(val) {
    return typeof val === "string";
}
// Thanks Artem Bochkarev
function styleToString(style) {
    if (typeof style === "string") {
        return style;
    }
    else if (style === undefined || style === null) {
        return "";
    }
    else {
        return Object.keys(style).reduce((acc, key) => acc +
            key
                .split(/(?=[A-Z])/)
                .join("-")
                .toLowerCase() +
            ":" +
            style[key] +
            ";", "");
    }
}
/* parentElements.childNodes is not an array. A slice() for it. */
function sliceDOMNodes(domNodes, from, to) {
    const result = [];
    for (let i = from; i < to; i++) {
        result.push(domNodes[i]);
    }
    return result;
}
/* parentElements.childNodes is not an array. A findIndex() for it. */
function findDOMNodeIndex(domNodes, element) {
    for (let i = 0; i < domNodes.length; i++) {
        if (domNodes[i] === element) {
            return i;
        }
    }
    return -1;
}
//# sourceMappingURL=index.js.map

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var forgo__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! forgo */ "./node_modules/forgo/dist/index.js");


if (window && !window.forgo) {
  window.forgo = forgo__WEBPACK_IMPORTED_MODULE_0__;
}

})();

/******/ })()
;
//# sourceMappingURL=forgo.js.map