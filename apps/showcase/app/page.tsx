import {
  Alert,
  Badge,
  Badges,
  Button,
  ButtonRow,
  Card,
  CardBody,
  CardCta,
  CardGrid,
  CardMeta,
  CardTitle,
  CardTop,
  Checkbox,
  CodeBlock,
  Container,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
  Display,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Eyebrow,
  Field,
  Form,
  Input,
  Lead,
  LinkButton,
  LinkCard,
  Prose,
  Radio,
  Row,
  Section,
  SectionLabel,
  Select,
  Stack,
  Switch,
  Table,
  TableOfContents,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tag,
  Tags,
  Textarea,
  Tooltip,
} from "@toyonix/web-kit/react";
import { appHref } from "@toyonix/web-kit";

const TOC_DEMO = [
  { id: "toc-why", text: "Why a table of contents", depth: 2 as const },
  { id: "toc-wide", text: "On wide screens", depth: 2 as const },
  { id: "toc-sticky", text: "It stays in view", depth: 3 as const },
  { id: "toc-narrow", text: "On phones", depth: 2 as const },
];

const TOKENS = [
  "bg",
  "surface",
  "surface-2",
  "text",
  "text-muted",
  "accent",
  "accent-text",
  "accent-2",
  "success",
  "warning",
  "danger",
  "card-1",
  "card-2",
  "card-3",
];

export default function Showcase() {
  return (
    <>
      <Container>
        <section className="pt-24 pb-16">
          <Eyebrow>Engineer · keyboards · web</Eyebrow>
          <Display className="max-w-[15ch]">
            I build tools, keyboards, and <em>small things</em> for the web.
          </Display>
          <Lead>
            This is the landing page, portfolio, and front door to every toyonix app. Each path is its own
            repo, deployed on its own, sharing one look.
          </Lead>
          <ButtonRow>
            <LinkButton href={appHref("articles")}>Read articles</LinkButton>
            <LinkButton href="#projects" variant="secondary">
              See projects
            </LinkButton>
            <LinkButton href="https://github.com/ToYoNiX" variant="ghost">
              GitHub ↗
            </LinkButton>
          </ButtonRow>
        </section>

        <Section id="projects">
          <SectionLabel>Projects</SectionLabel>
          <CardGrid>
            <LinkCard href={appHref("articles")}>
              <CardTop>
                <CardMeta>/articles</CardMeta>
                <Badge tone="success">live</Badge>
              </CardTop>
              <CardTitle>Articles</CardTitle>
              <CardBody>Notes, write-ups, and long-form posts about the things I&apos;m building.</CardBody>
              <Tags>
                <Tag>mdx</Tag>
                <Tag>writing</Tag>
              </Tags>
              <CardCta>Open →</CardCta>
            </LinkCard>
            <LinkCard href={appHref("gen")}>
              <CardTop>
                <CardMeta>/gen</CardMeta>
                <Badge tone="warning">beta</Badge>
              </CardTop>
              <CardTitle>Gen</CardTitle>
              <CardBody>
                Keyboard layout and PCB generator. A ground-up rewrite of an Ergogen GUI fork.
              </CardBody>
              <Tags>
                <Tag>ergogen</Tag>
                <Tag>keyboards</Tag>
              </Tags>
              <CardCta>Open →</CardCta>
            </LinkCard>
            <LinkCard href={appHref("collect")}>
              <CardTop>
                <CardMeta>/collect</CardMeta>
                <Badge>archived</Badge>
              </CardTop>
              <CardTitle>Collect</CardTitle>
              <CardBody>A small data collection app built for a research side project.</CardBody>
              <Tags>
                <Tag>forms</Tag>
                <Tag>data</Tag>
              </Tags>
              <CardCta>Open →</CardCta>
            </LinkCard>
          </CardGrid>
        </Section>

        <Section>
          <SectionLabel>Article</SectionLabel>
          <div className="grid items-start gap-14 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div>
              <Eyebrow>Oct 18, 2026 · 6 min read</Eyebrow>
              <Prose dropcap>
                <h2>One kit, many repos</h2>
                <p>
                  Every app lives at its own first path segment and is deployed from its own repository. They
                  all share <code>@toyonix/web-kit</code>, so the header, the colors, and the dark mode you
                  picked follow you from page to page. The routing comes for free from{" "}
                  <a href="https://pages.github.com">GitHub Pages</a>.
                </p>
                <h3>How a deploy works</h3>
                <ol>
                  <li>A kit release is published to npm.</li>
                  <li>
                    The dispatcher finds every repo tagged <code>toyonix-site</code>.
                  </li>
                  <li>Each site rebuilds against the new kit and redeploys.</li>
                </ol>
                <CodeBlock>
                  <span className="tx-code__comment"># .github/workflows/deploy.yml</span>
                  {"\n"}
                  <span className="tx-code__key">on</span>:{"\n  "}
                  <span className="tx-code__key">push</span>: {"{ "}
                  <span className="tx-code__key">branches</span>: [
                  <span className="tx-code__string">main</span>]{" }\n  "}
                  <span className="tx-code__key">workflow_dispatch</span>:{"\n"}
                  <span className="tx-code__key">jobs</span>:{"\n  "}
                  <span className="tx-code__key">deploy</span>:{"\n    "}
                  <span className="tx-code__key">uses</span>:{" "}
                  <span className="tx-code__string">
                    toyonix/web-kit/.github/workflows/site-deploy.yml@v0
                  </span>
                </CodeBlock>
                <hr />
                <blockquote>Fix it when you see it, but make sure you see it.</blockquote>
                <p>
                  A failed build never takes a site down; the previous version stays live until the next green
                  deploy.
                </p>
              </Prose>
            </div>

            <Card>
              <CardTitle>New layout</CardTitle>
              <Form>
                <Field label="Name" hint="Used as the file name on export.">
                  <Input placeholder="corne-ish" />
                </Field>
                <Field label="Shape">
                  <Select defaultValue="split-35">
                    <option value="split-35">Split · 3×5 + 3</option>
                    <option value="split-36">Split · 3×6 + 3</option>
                    <option value="unibody">Unibody</option>
                  </Select>
                </Field>
                <Field label="Notes">
                  <Textarea placeholder="Anything worth remembering…" />
                </Field>
                <Checkbox label="Mirror halves" defaultChecked />
                <Row>
                  <Radio name="switch" label="Choc" defaultChecked />
                  <Radio name="switch" label="MX" />
                </Row>
                <Switch label="Show footprints" defaultChecked />
                <ButtonRow>
                  <Button type="submit">Generate</Button>
                  <Button type="reset" variant="ghost">
                    Reset
                  </Button>
                </ButtonRow>
              </Form>
            </Card>
          </div>
        </Section>

        <Section>
          <SectionLabel>Components</SectionLabel>
          <div className="tx-grid-2">
            <Stack>
              <div>
                <p className="tx-label mb-2.5">Buttons</p>
                <ButtonRow>
                  <Button>Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Delete</Button>
                  <Button variant="secondary" disabled>
                    Disabled
                  </Button>
                </ButtonRow>
              </div>
              <div>
                <p className="tx-label mb-2.5">Badges</p>
                <Badges>
                  <Badge tone="accent">new</Badge>
                  <Badge tone="success">live</Badge>
                  <Badge tone="warning">beta</Badge>
                  <Badge tone="danger">failed</Badge>
                  <Badge>archived</Badge>
                </Badges>
              </div>
              <Stack className="gap-3">
                <Alert title="Kit 1.4.0 released">All sites will redeploy in a few minutes.</Alert>
                <Alert tone="success" title="Deployed">
                  gen is live at /gen/.
                </Alert>
                <Alert tone="warning" title="Deprecated">
                  &lt;OldCard&gt; will be removed in 2.0.
                </Alert>
                <Alert tone="danger" title="Build failed">
                  collect: type error in app/page.tsx.
                </Alert>
              </Stack>
            </Stack>
            <Stack>
              <div>
                <p className="tx-label mb-2.5">Table</p>
                <Table>
                  <thead>
                    <tr>
                      <th>App</th>
                      <th>Path</th>
                      <th>Kit</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Home", "/", "1.4.0", "success", "live"],
                      ["Articles", "/articles", "1.4.0", "success", "live"],
                      ["Gen", "/gen", "1.4.0", "warning", "beta"],
                      ["Collect", "/collect", "1.3.2", "danger", "failed"],
                    ].map(([app, path, kit, tone, status]) => (
                      <tr key={app}>
                        <td>{app}</td>
                        <td>
                          <code>{path}</code>
                        </td>
                        <td>{kit}</td>
                        <td>
                          <Badge tone={tone as "success" | "warning" | "danger"}>{status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              <div>
                <p className="tx-label mb-2.5">Overlays</p>
                <ButtonRow>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="secondary">Open dialog</Button>
                    </DialogTrigger>
                    <DialogContent title="Delete layout?" description="This can't be undone.">
                      <ButtonRow>
                        <DialogClose asChild>
                          <Button variant="danger">Delete</Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button variant="ghost">Cancel</Button>
                        </DialogClose>
                      </ButtonRow>
                    </DialogContent>
                  </Dialog>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary">Menu ▾</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Layout</DropdownMenuLabel>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem>Export…</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem disabled>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Tooltip content="Copies a share link">
                    <Button variant="ghost">Hover me</Button>
                  </Tooltip>
                </ButtonRow>
              </div>
              <Tabs defaultValue="preview">
                <TabsList>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="config">Config</TabsTrigger>
                </TabsList>
                <TabsContent value="preview">Tabs use the same active style as the nav.</TabsContent>
                <TabsContent value="config">
                  <code>points.zones.matrix</code>
                </TabsContent>
              </Tabs>
            </Stack>
          </div>
        </Section>

        <Section>
          <SectionLabel>Table of contents</SectionLabel>
          <div className="tx-with-toc">
            <Prose>
              {TOC_DEMO.map((item) => {
                const Heading = item.depth === 2 ? "h2" : "h3";
                return (
                  <div key={item.id}>
                    <Heading id={item.id}>{item.text}</Heading>
                    <p>
                      On wide screens the list on the right stays in view and marks the section you&apos;re
                      reading. On narrow screens it moves into a menu that slides in from the right, opened
                      from the floating button.
                    </p>
                  </div>
                );
              })}
            </Prose>
            <TableOfContents items={TOC_DEMO} />
          </div>
        </Section>

        <Section>
          <SectionLabel>Tokens</SectionLabel>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-3">
            {TOKENS.map((token) => (
              <div key={token} className="border-[2.5px] border-border bg-surface text-xs">
                <div className="h-14 border-b border-border" style={{ background: `var(--tx-${token})` }} />
                <div className="px-2.5 py-2 font-mono font-bold">{token}</div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-text-muted">
            Tailwind utilities map to the same tokens:{" "}
            <code className="text-accent-text">text-accent-text</code>,{" "}
            <code className="text-accent-text">bg-surface</code>,{" "}
            <code className="text-accent-text">font-serif</code>.
          </p>
        </Section>
      </Container>
    </>
  );
}
