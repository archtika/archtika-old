import { Type, Static } from '@sinclair/typebox'

const createComponentTextSchema = Type.Object(
    {
        type: Type.Literal('text'),
        content: Type.Object({
            textContent: Type.String({ minLength: 1 })
        })
    },
    {
        additionalProperties: false
    }
)

const updateComponentTextSchema = Type.Object(
    {
        type: Type.Literal('text'),
        content: Type.Object({
            textContent: Type.Optional(Type.String({ minLength: 1 }))
        })
    },
    {
        additionalProperties: false
    }
)

const createComponentButtonSchema = Type.Object(
    {
        type: Type.Literal('button'),
        content: Type.Object({
            label: Type.String({ minLength: 1 }),
            hyperlink: Type.String()
        })
    },
    {
        additionalProperties: false
    }
)

const updateComponentButtonSchema = Type.Object(
    {
        type: Type.Literal('button'),
        content: Type.Object({
            label: Type.Optional(Type.String({ minLength: 1 })),
            hyperlink: Type.Optional(Type.String())
        })
    },
    {
        additionalProperties: false
    }
)

const createComponentImageSchema = Type.Object(
    {
        type: Type.Literal('image'),
        content: Type.Object({
            altText: Type.Optional(Type.String({ minLength: 1 }))
        }),
        assetId: Type.String()
    },
    {
        additionalProperties: false
    }
)

const updateComponentImageSchema = Type.Object(
    {
        type: Type.Literal('image'),
        content: Type.Object({
            altText: Type.Optional(Type.String({ minLength: 1 }))
        }),
        assetId: Type.Optional(Type.String())
    },
    {
        additionalProperties: false
    }
)

const createComponentVideoSchema = Type.Object(
    {
        type: Type.Literal('video'),
        content: Type.Object({
            altText: Type.Optional(Type.String({ minLength: 1 })),
            isLooped: Type.Optional(Type.Boolean())
        }),
        assetId: Type.String()
    },
    {
        additionalProperties: false
    }
)

const updateComponentVideoSchema = Type.Object(
    {
        type: Type.Literal('video'),
        content: Type.Object({
            altText: Type.Optional(Type.String({ minLength: 1 })),
            isLooped: Type.Optional(Type.Boolean())
        }),
        assetId: Type.Optional(Type.String())
    },
    {
        additionalProperties: false
    }
)

const createComponentAudioSchema = Type.Object(
    {
        type: Type.Literal('audio'),
        content: Type.Object({
            altText: Type.Optional(Type.String({ minLength: 1 })),
            isLooped: Type.Optional(Type.Boolean())
        }),
        assetId: Type.String()
    },
    {
        additionalProperties: false
    }
)

const updateComponentAudioSchema = Type.Object(
    {
        type: Type.Literal('audio'),
        content: Type.Object({
            altText: Type.Optional(Type.String({ minLength: 1 })),
            isLooped: Type.Optional(Type.Boolean())
        }),
        assetId: Type.Optional(Type.String())
    },
    {
        additionalProperties: false
    }
)

const createComponentAccordionSchema = Type.Object(
    {
        type: Type.Literal('accordion'),
        content: Type.Object({
            title: Type.String({ minLength: 1 }),
            accordionContent: Type.String({ minLength: 1 }),
            isOpen: Type.Optional(Type.Boolean())
        })
    },
    {
        additionalProperties: false
    }
)

const updateComponentAccordionSchema = Type.Object(
    {
        type: Type.Literal('accordion'),
        content: Type.Object({
            title: Type.Optional(Type.String({ minLength: 1 })),
            accordionContent: Type.Optional(Type.String({ minLength: 1 })),
            isOpen: Type.Optional(Type.Boolean())
        })
    },
    {
        additionalProperties: false
    }
)

export const componentSingleParamsSchema = Type.Object({
    id: Type.Integer({ minimum: 1 })
})

export type ComponentSingleParamsSchemaType = Static<
    typeof componentSingleParamsSchema
>

export const componentParamsSchema = Type.Object({
    pageId: Type.Integer({ minimum: 1 }),
    componentId: Type.Integer({ minimum: 1 })
})

export type ComponentParamsSchemaType = Static<typeof componentParamsSchema>

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
        'x-examples': {
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
        'x-examples': {
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
    }
)

export type UpdateComponentSchemaType = Static<typeof updateComponentSchema>

export const createComponentPositionSchema = Type.Object({
    grid_x: Type.Integer({ minimum: 0 }),
    grid_y: Type.Integer({ minimum: 0 }),
    grid_width: Type.Integer({ minimum: 1 }),
    grid_height: Type.Integer({ minimum: 1 })
})

export type CreateComponentPositionSchemaType = Static<
    typeof createComponentPositionSchema
>
