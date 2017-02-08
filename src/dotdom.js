((global, document, Object, vnodeFlag, createElement, render, global_state={}) => {

  // Make all strings considered child nodes
  String.prototype[vnodeFlag] = 1;

  /**
   * Create a VNode element
   */
  global.H = createElement = (element, props={}, ...children) => ({
    [vnodeFlag]: 1,                                                   // The vnodeFlag symbol is used by the code
                                                                      // in the 'P' property to check if the `props`
                                                                      // argument is not an object, but a renderable
                                                                      // VNode child

    E: element,                                                       // 'E' holds the name or function passed as
                                                                      // first argument

    P: props[vnodeFlag]                                               // If the props argument is a renderable VNode,
        && children.unshift(props) && {C: children}                   // ... prepend it to the children
        || (props.C = children) && props                              // ... otherwise append 'C' to the property
  })

  /**
   * Render the given VNode structure given to the DOM element given
   *
   * @param {VNode} - A VNode instance, created with `createElement`
   * @param {DOMElement} - The HTML DOM element
   * @returns {DOMElement} - The rendered DOM element
   */
  global.R = render = (vnode, dom, _path='', _update, _element=vnode.E, _props=vnode.P) =>

    vnode.trim                                                        // Strings have a `.trim` function

    ? dom.appendChild(                                                // ** String Node **
        document.createTextNode(vnode)
      )

    : _element.call                                                   // If element is a functional component, it
                                                                      // will have the 'call' property defined.

                                                                      // ** Stateful Render **

    ? (_update = (                                                    // Create a helper function that will be called
                                                                      // when the component is updated.

          state = [{}],                                               // Default falue if the global state is missing

          _state =
            state[1] == _element                                      // If the global state holds stale information
            ? state[0]                                                // about the component we are rendering, then
            : (global_state[_path] = [{}])[0],                        // reset the state object

          _instance                                                   // Local variable for the mounted DOM instance
        ) =>
        _instance = render(                                           // In the update function we render the new DOM
                                                                      // element and we keep track of it

          _element(                                                   // We call the component function to create the
                                                                      // new virtual DOM, passing the following props:
            _props,                                                   // - The properties of the component
            _state,                                                   // - The current state of the component
            newState =>                                               // - The `setState` function

              dom.replaceChild(                                       // The setState function replaces the previous
                                                                      // DOM instance with the re-render of the
                                                                      // component, by calling the update function
                _update(
                  global_state[_path] = [                             // We also update the global state for the
                                                                      // component path, ensuring that we keep:
                    Object.assign(                                    // - The new state
                      _state,
                      newState
                    ),
                    _element                                          // - The component function, to use it for
                                                                      //   stale detection (check above)
                  ]
                ),
                _instance
              )
          ),
          dom,
          _path
        )
      )(global_state[_path])                                          // We pass the current state of this component
                                                                      // that will default to `[{}, undefined]`

                                                                      // ** Native Render **

    : Object.keys(_props)                                             // We are going to apply the properties by
                                                                      // iterating on each property individually
      .reduce(
        (
          instance,                                                   // Reference to the new DOM element
          key,                                                        // The property to apply
          index,                                                      // Not used
          array,                                                      // Not used
          _value=_props[key]                                          // Local reference to the property value
        ) =>
          (
            key == 'C' ?                                              // ## Children ##

              _value.map((child,i) =>                                 // DOM VNodes are iterated through
                  render(
                    child,
                    instance,
                    _path+'.'+i
                  )
                )

            /* OR */

            : key == 'style' ?                                        // ## Style ##

              Object.assign(                                          // Style property is applied recursively to the
                instance[key],                                        // CSS style of the element instance.
                _value
              )

            /* OR */

            : /^on/.exec(key) ?                                       // ## Callbacks ##

              instance.addEventListener(                              // Properties starting with `on` are registered
                key.substr(2),                                        // as event listeners to the DOM instance
                _value
              )

            /* OR */

            : instance.setAttribute(                                  // ## Attributes ##
                key,                                                  // Any other properties are assigned as attributes
                _value
              )

          ) && instance || instance                                   // Make sure to *always* return the instance

      ,                                                               // We are passing to the reduce function a new
                                                                      // child mounted to the DOM element

        dom.appendChild(                                              // We are appending to the `dom` argument a new
          document.createElement(
            _element
          )
        )
      )

  /**
   * Expand some of the default tags
   */
  'a.b.button.i.span.div.img.p.h1.h2.h3.h4.table.tr.td.th.ul.ol.li.form.input.label.select.option'
    .split('.')
    .map(
      (dom) =>
        global[dom] = createElement.bind(global, dom)
    )

})(window, document, Object, Symbol());
