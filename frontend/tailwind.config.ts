import tailwindForms from '@tailwindcss/forms'
import tailwindTypography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    theme: {
        extend: {}
    },
    plugins: [tailwindForms, tailwindTypography]
}
