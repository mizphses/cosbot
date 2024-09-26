import { PrismaD1 } from '@prisma/adapter-d1'
import { PrismaClient } from '@prisma/client'
import { Context, Hono, Next } from 'hono'
import { jwt } from 'hono/jwt'
import { chatAnthropic } from '../lib/anthropic'
import { TextBlock } from '@anthropic-ai/sdk/resources/messages.mjs'

const projects = new Hono<{ Bindings: CloudflareBindings }>()

projects.use(
  '/*',
  async (
    c: Context<{
      Bindings: CloudflareBindings
    }>,
    next: Next,
  ) => jwt({ secret: c.env.TOKEN_KEY })(c, next),
)

projects.get('/', async (c) => {
  return c.json({
    message: 'Working!',
  })
})

type RequestType = {
  name: string
  description?: string
}

projects.post('/new', async (c) => {
  const adapter = new PrismaD1(c.env.DB)
  const prisma = new PrismaClient({ adapter })

  const { name, description } = await c.req.json<RequestType>()
  const project = await prisma.projects.create({
    data: {
      name,
      description,
    },
  })

  return c.json({
    message: 'New project created!',
    id: project.id,
  })
})

projects.get('/list', async (c) => {
  const adapter = new PrismaD1(c.env.DB)
  const prisma = new PrismaClient({ adapter })

  const projects = await prisma.projects.findMany()

  return c.json(projects)
})

projects.get('/:id', async (c) => {
  const adapter = new PrismaD1(c.env.DB)
  const prisma = new PrismaClient({ adapter })

  const id = c.req.param('id')
  const project = await prisma.projects.findUnique({
    where: {
      id,
    },
  })

  return c.json(project)
})

type ProductTypeReq = {
  product_type: string
}

projects.post('/:id/new', async (c) => {
  const { product_type } = await c.req.json<ProductTypeReq>()
  const data = (await chatAnthropic(
    c.env.ANTHROPIC_API_KEY,
    [
      {
        role: 'user',
        content: `You are tasked with creating a one-page web application (landing page) for a fictional product. The goal is to create an engaging and informative page that showcases the product's features and benefits.\n\nFollow these guidelines to create the one-page web application:\n\n1. Product Type:\nYou will be creating a landing page for the following product type:\n<product_type>\n${product_type}\n</product_type>\n\n2. Content Sections:\nCreate the following sections for the landing page:\na) Header: Include a catchy headline and a brief (1-2 sentences) value proposition.\nb) Product Description: Write a concise paragraph (3-5 sentences) describing the product and its main benefits.\nc) Key Features: List 3-5 key features of the product, each with a short description.\nd) Call to Action (CTA): Create a compelling CTA button with appropriate text.\ne) Testimonial: Write a brief customer testimonial (2-3 sentences) praising the product.\nf) Contact Information: Include basic contact details (email and phone number).\n\n3. Design and Layout:\n- Keep the design clean and modern.\n- Use a color scheme that complements the product type.\n- Ensure the layout is easy to read and visually appealing.\n- Suggest the use of relevant icons or images to enhance the visual appeal.\n\n4. Output Format:\nPresent your one-page web application design in the following format:\n\n<landing_page>\n<header>\n[Include headline and value proposition]\n</header>\n\n<product_description>\n[Include product description]\n</product_description>\n\n<key_features>\n[List key features]\n</key_features>\n\n<cta>\n[Include call-to-action button text]\n</cta>\n\n<testimonial>\n[Include customer testimonial]\n</testimonial>\n\n<contact_info>\n[Include contact information]\n</contact_info>\n\n<design_notes>\n[Include brief notes on color scheme and suggested visual elements]\n</design_notes>\n</landing_page>\n\nCreate an engaging and persuasive one-page web application based on these instructions. Be creative and tailor the content to the specific product type provided.`,
      },
      {
        role: 'assistant',
        content: '<html>\n  <head>\n    <title>',
      },
    ],
    'You are powerful and widely famous UI designer. You are asked to design the landing page of the one user initiated. Please generate the website following the restrictions and instructions given below.\n<instructions>\n* The user will ask you to create the page to introduce web app\n</instructions>\n\n<restrictions>\n* Heights must not include 3 times taller than width.\n* Logos should be the text.\n* The page should be the one Japanese likes the most.\n* The page should contain the descriptions, cta, and footer.\n</restrictions>',
  )) as { content: TextBlock[] }

  console.log(data.content)
  return c.html(`<html>\n  <head>\n    <title>${data.content[0].text}`)
})

export default projects
