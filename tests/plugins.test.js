const whenipress = require('./../whenipress')

afterEach(() => {
    whenipress().stopAll()
    whenipress().flushPlugins()
})

test('it can be notified of when a new binding is registered', done => {

    const examplePlugin = {
        bindingRegistered: (binding, globalInstance) => {
            expect(binding).toEqual(['a'])
            expect(globalInstance.bindings().length).toBe(1)
            done()
        }
    }

    whenipress().use(examplePlugin)

    whenipress('a').then(e => {})
})

test('it can be notified of when all bindings are stopped', done => {
    const plugin = {
        allBindingsStopped: globalInstance => {
            expect(globalInstance.bindings().length).toBe(0)
            done()
        }
    }

    whenipress().use(plugin)

    whenipress('a').then(e => {})
    expect(whenipress().bindings().length).toBe(1)
    whenipress().stopAll()
})

test('it may be notified of when a single binding is stopped', done => {
    const plugin = {
        bindingStopped: (keys, globalInstance) => {
            expect(keys).toEqual(['a'])
            expect(globalInstance.bindings().length).toBe(0)
            done()
        }
    }

    whenipress().use(plugin)

    let binding = whenipress('a').then(e => {})
    expect(whenipress().bindings().length).toBe(1)
    binding.stop()
})

test('it may hook in directly before an event handler', () => {
    var eventFiredCount = 0
    var beforeHandled = false

    const plugin = {
        beforeBindingHandled: (keys, globalInstance) => {
            expect(eventFiredCount).toBe(0)
            beforeHandled = true
        }
    }

    whenipress().use(plugin)
    whenipress('a').then(e => eventFiredCount++)

    press('a')
    expect(eventFiredCount).toBe(1)
    expect(beforeHandled).toBeTruthy()
})

test('a plugin may emit options', () => {
    const examplePlugin = {}

    whenipress().use(examplePlugin)

    whenipress('a').then(e => {})

    expect(whenipress().pluginsManager.plugins.length).toBe(1)
})

test('multiple plugins may be registered', () => {
    var pluginCalledCount = 0

    const examplePlugin = {
        bindingRegistered: (binding, globalInstance) => {
            pluginCalledCount++
        }
    }

    whenipress().use(examplePlugin, examplePlugin)

    whenipress('a').then(e => {})

    expect(pluginCalledCount).toBe(2)
})

test('plugins may be cleared', () => {
    whenipress().use({})

    expect(whenipress().pluginsManager.plugins.length).toBe(1)

    whenipress().flushPlugins()

    expect(whenipress().pluginsManager.plugins.length).toBe(0)
})

function press(...keys) {
    keys.forEach(key => dispatchKeyDown(key))
    keys.forEach(key => dispatchKeyUp(key))
}

function dispatchKeyDown(key) {
    document.dispatchEvent(new KeyboardEvent('keydown', {'key': key}))
}

function dispatchKeyUp(key) {
    document.dispatchEvent(new KeyboardEvent('keyup', {'key': key}))
}