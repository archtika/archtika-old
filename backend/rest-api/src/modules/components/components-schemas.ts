import { Static, Type } from '@sinclair/typebox'

export const singleParamsSchema = Type.Object({
    id: Type.String({ minLength: 36, maxLength: 36 })
})

export type SingleParamsSchemaType = Static<typeof singleParamsSchema>

export const paramsSchema = Type.Object({
    pageId: Type.String({ minLength: 36, maxLength: 36 }),
    componentId: Type.String({ minLength: 36, maxLength: 36 })
})

export type ParamsSchemaType = Static<typeof paramsSchema>

const createComponentTextSchema = Type.Object({
    type: Type.Literal('text'),
    content: Type.Object({
        textContent: Type.String({ minLength: 1 })
    })
})

const updateComponentTextSchema = Type.Object({
    type: Type.Literal('text'),
    content: Type.Object({
        textContent: Type.Optional(Type.String({ minLength: 1 }))
    })
})

const createComponentButtonSchema = Type.Object({
    type: Type.Literal('button'),
    content: Type.Object({
        label: Type.String({ minLength: 1 }),
        hyperlink: Type.String()
    })
})

const updateComponentButtonSchema = Type.Object({
    type: Type.Literal('button'),
    content: Type.Object({
        label: Type.Optional(Type.String({ minLength: 1 })),
        hyperlink: Type.Optional(Type.String())
    })
})

const createComponentImageSchema = Type.Object({
    type: Type.Literal('image'),
    content: Type.Object({
        altText: Type.Optional(Type.String({ minLength: 1 }))
    }),
    assetId: Type.String()
})

const updateComponentImageSchema = Type.Object({
    type: Type.Literal('image'),
    content: Type.Object({
        altText: Type.Optional(Type.String({ minLength: 1 }))
    }),
    assetId: Type.Optional(Type.String())
})

const createComponentVideoSchema = Type.Object({
    type: Type.Literal('video'),
    content: Type.Object({
        altText: Type.Optional(Type.String({ minLength: 1 })),
        isLooped: Type.Optional(Type.Boolean())
    }),
    assetId: Type.String()
})

const updateComponentVideoSchema = Type.Object({
    type: Type.Literal('video'),
    content: Type.Object({
        altText: Type.Optional(Type.String({ minLength: 1 })),
        isLooped: Type.Optional(Type.Boolean())
    }),
    assetId: Type.Optional(Type.String())
})

const createComponentAudioSchema = Type.Object({
    type: Type.Literal('audio'),
    content: Type.Object({
        altText: Type.Optional(Type.String({ minLength: 1 })),
        isLooped: Type.Optional(Type.Boolean())
    }),
    assetId: Type.String()
})

const updateComponentAudioSchema = Type.Object({
    type: Type.Literal('audio'),
    content: Type.Object({
        altText: Type.Optional(Type.String({ minLength: 1 })),
        isLooped: Type.Optional(Type.Boolean())
    }),
    assetId: Type.Optional(Type.String())
})

const createComponentAccordionSchema = Type.Object({
    type: Type.Literal('accordion'),
    content: Type.Object({
        title: Type.String({ minLength: 1 }),
        accordionContent: Type.String({ minLength: 1 }),
        isOpen: Type.Optional(Type.Boolean())
    })
})

const updateComponentAccordionSchema = Type.Object({
    type: Type.Literal('accordion'),
    content: Type.Object({
        title: Type.Optional(Type.String({ minLength: 1 })),
        accordionContent: Type.Optional(Type.String({ minLength: 1 })),
        isOpen: Type.Optional(Type.Boolean())
    })
})

export const exampleComponentValues = {
    Text: {
        value: {
            type: 'text',
            content: {
                textContent: 'Hello, world!'
            }
        }
    },
    Button: {
        value: {
            type: 'button',
            content: {
                label: 'Click me!',
                hyperlink: 'https://example.com'
            }
        }
    },
    Image: {
        value: {
            type: 'image',
            content: {
                altText: 'An image of a cat'
            },
            assetId: '00000000-0000-0000-0000-000000000000'
        }
    },
    Video: {
        value: {
            type: 'video',
            content: {
                altText: 'A video of a cat',
                isLooped: true
            },
            assetId: '00000000-0000-0000-0000-000000000000'
        }
    },
    Audio: {
        value: {
            type: 'audio',
            content: {
                altText: 'An audio of a cat',
                isLooped: true
            },
            assetId: '00000000-0000-0000-0000-000000000000'
        }
    },
    Accordion: {
        value: {
            type: 'accordion',
            content: {
                title: 'Accordion title',
                accordionContent: 'Accordion content',
                isOpen: true
            }
        }
    }
}

export const createComponentSchema = Type.Union(
    [
        createComponentTextSchema,
        createComponentButtonSchema,
        createComponentImageSchema,
        createComponentVideoSchema,
        createComponentAudioSchema,
        createComponentAccordionSchema
    ],
    {
        'x-examples': exampleComponentValues
    }
)

export type CreateComponentSchemaType = Static<typeof createComponentSchema>

export const updateComponentSchema = Type.Union(
    [
        updateComponentTextSchema,
        updateComponentButtonSchema,
        updateComponentImageSchema,
        updateComponentVideoSchema,
        updateComponentAudioSchema,
        updateComponentAccordionSchema
    ],
    {
        'x-examples': exampleComponentValues
    }
)

export type UpdateComponentSchemaType = Static<typeof updateComponentSchema>

export const componentPositionSchema = Type.Object({
    grid_x: Type.Integer({ minimum: 0 }),
    grid_y: Type.Integer({ minimum: 0 }),
    grid_width: Type.Integer({ minimum: 1 }),
    grid_height: Type.Integer({ minimum: 1 })
})

export type ComponentPositionSchemaType = Static<typeof componentPositionSchema>
