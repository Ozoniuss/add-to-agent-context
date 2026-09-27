# How I ended up writing my first VS Code extension to work with AI

I finally released the [VS Code extension](https://github.com/Ozoniuss/add-to-agent-context) that I use to work with agents in VS Code. Sharing some of my experiences from the process. But first, some background. If you're only interested in the learnings, skip the following section.

## Changes in my development workflow

I always found it fascinating to watch people like ThePrimeagen [code in vim](https://www.youtube.com/watch?v=X6AR2RMB5tE) and while I would have loved to get to that level, I never found the motivation to be consistent at learning vim. It's one of those things where I just wanted the outcome but wasn't interested in the journey.

However, I do acknowledge the productivity benefits that come with knowing your code editor, especially keyboard shortcuts. I was a long-time VS Code user so I found it easier to invest time into learning the editor than learning vim almost from scratch. I still disliked the journey and it took me some time, but I got to the point where I am fast with it and can mostly use it with just the keyboard. Then, AI had to come along and mess things up.

Once Cursor became mainstream, my development workflow changed in a way that I wasn't able to reproduce in VS Code anymore. `Tab` was now my favorite keyboard shortcut, which was a problem since I wasn't willing to pay for Cursor and only had it at work. Later, with better models and radical changes brought by CLI agent harnesses, my interest in maintaining the productive workflow I invested so much time in dropped steeply. I would change between editors and terminals several times a day, often based solely on which agent I vibed more with. I didn't care about the tool as much as the relationship it gave me with the agent.

Don't get me wrong, I was faster with these new agents. But based on my old standard, I wasn't what I'd call "fast" in these new development environments, especially when it came to telling the agent about code snippets.

I won't get into details about how I use agents. I generally follow recent developments to keep myself up to date and try out new ways of working but don't particularly enjoy talking about it (unless I rant about ways of working I hate, which I've no shortage of). Usually when I work with code, my AI use can be oversimplified to something like:

- Grab one or more code snippets or files;
- Add those selections to an agent's context;
- Prompt the agent (either to write something new, change something, ask about something etc.).

Obviously this isn't the whole picture. But I see this pattern regularly when I need to dig into code.

Cursor was great at first, but over time a lot of stupid things that annoyed me piled up. I hated having to maintain my VS Code setup across two apps and even though it's a VS Code fork, it still felt like a different product. I never got it to look the same, it regularly broke functionality that worked in VS Code and, remember, I could only use it at work. At the time I was having good results with the CLI and got comfortable, so when my old workflow kept breaking, I was pretty much only using it as a drag-and-drop tool. Eventually, I was frustrated to end up in this situation by moving away from something that worked well, so when support for Cursor became more limited at work compared to CLI tools, I gave up on it.

On top of this, I like [OpenAI models](https://openai.com/index/our-decision-on-cursor-following-its-acquisition-by-spacex/) and was mainly using those with Cursor. It just wasn't meant to last. Bye bye, Cursor.

I fully switched over to the CLIs, but I still needed an editor to actually read code. Switching between CLI and editor was taking more time than I liked and the Claude and Codex extensions in VS Code simply aren't as polished as Cursor was. In fact, by default Claude Code doesn't offer anything useful to add context interactively, and Codex is limited to right-clicking. I wanted something more Cursor-like that worked with both, rather than just trying to figure out shortcuts for the commands they offered.

So in the end I was like, yeah fuck this. It's the vibe-coding era, so why not just build my own extension? I know this makes me sound like a neovim user in VS Code which gives me mixed feelings, but I YOLO-ed out a PoC and after having used it for a while, I finally released my extension. I'm happy to be back at my reliable VS Code setup that now supports my new way of working, the way I like it. There are a few [demos](https://github.com/Ozoniuss/add-to-agent-context) if you're interested in how it works. The interactive experience isn't as polished as Cursor was, but I couldn't be happier since I can use it with my own subscriptions at home and the models I like at work.

Anyway, that background ended up longer than I wanted. Now, the learnings.

## Presenting the project

Most of the time the cover is (unfortunately) much more important than the content. When I decided to make this extension public, I knew that I needed to work on how I present it. Writing good documents is fucking difficult and even though we have AI now, I find most documents that are fully generated to be complete garbage. It was quite obvious that I would end up completely rewriting what the AI generated while iterating.

I think the most interesting experience for me was having to work on this project from two roles: both as a developer and as a user. Changing hats while thinking about the experience, testing the features and actually working on the implementation is not something I do often. So when presenting the project I ended up with a document for each role (a `README.md` for users and a `CONTRIBUTING.md` for developers).

Thing is, I am still not sure myself what good documents look like. I can tell when I prefer one over another but I never really took the time to understand why. For the README I assumed that whoever would use my extension only cares about what it can do and how to get it working as easily as possible. To give some examples, I found having demo videos important. But AI explaining [why](https://github.com/Ozoniuss/add-to-agent-context/blob/8275a3185c40ef604c0116e0dd4bd83aa26a4628/README.md#configuring-agents) the extension config looks a certain way by going into implementation details screams vibe-slop. I still think it could be better, but that conflicts with me thinking that my time could be spent better than perfecting a README for the one user who designed the thing.

I left the technical details for the `CONTRIBUTING.md`, but even there it's mostly about getting started with local development (which tools you need, how to run it etc.) and how to make contributions. The project has about 500 lines of useful code so I felt it wasn't really worth going into technical details. Your agent can probably figure all of them out in a single prompt anyway.

Maybe in the past these would have sufficed, but there's an implicit third role that you can't ignore nowadays: the AI contributor. You better not forget about `AGENTS.md` and other AI-targeted markdown files in the vibe-coding era. You want random cloud agents making _good_ contributions to improve the project, right? Right...?

## Distribution

I haven't actually had to deal with software distribution too much in the past so this was something new to me. The steps I had in mind sound quite straightforward:

- Build the artifact;
- Upload the artifact on the public internet;
- Now anybody can download the artifact.

Easy, right? Yeah, but when I put it like this I sound like a micro-manager. You can branch into an endless amount of questions for every single one of these bullet points, especially if you care about security and user experience. Here, I'll just briefly share what I'm doing:

- I associate a new "release" with pushing a GitHub tag like `v1.2.3` on main;
- When a "release" is created, it will look through `CHANGELOG.md` and extract the matching release notes from there. I keep an "Unreleased" section in the changelog to accumulate changes and rename it to the release version when I am ready to release;
- A GitHub action compiles a `.vsix` artifact (which is the distribution format for VS Code extensions) and uploads it to a GitHub release;
- I manually download the artifact from the GitHub release and upload it to the [VS Code Marketplace](https://marketplace.visualstudio.com/VSCode).

Publishing the extension to the [Marketplace](https://marketplace.visualstudio.com/VSCode) is a huge pain in the ass to automate. Seriously, what is [this shit?](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) Why do I need Azure DevOps just to publish an artifact and even then, why are there so many steps?? I do acknowledge that my attention span gets severely impaired these days by both ADHD and too much AI, but even after forcing myself to read through it all, I'd still rather manually upload the artifact that is built by my GitHub action than set up that abomination. As a comparison, my GitHub release pipeline took 5 minutes to set up, most of them spent waiting on the agent.

In all fairness, reliable distribution is complex, so there are probably good reasons behind that process. In that regard, I'm happy to be the only user of my extension since I can do whatever I want.

> Note: I found [this](https://github.com/microsoft/vscode-vsce#trusted-publishing) which may be simpler, but haven't tried. And yeah, docs don't mention this. There's only a [5-year](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#platform-specific-extensions) old example hidden at the end.

## TypeScript

As a long-time Go developer, I do find reading TypeScript to be kind of disgusting. I don't actually know if the snippet below is idiomatic or whatever, but this is what my agent produced at some point:

```ts
function configuredAgents(): AgentConfig[] {
  const agents = vscode.workspace
    .getConfiguration('addToAgentContext')
    .get<Record<string, Omit<AgentConfig, 'id'> | null>>('agents', {});
  return Object.entries(agents)
    .filter(([, a]) => a && a.label && a.command)
    .map(([id, a]) => ({ ...a!, id }));
}
```

I mean, just what the fuck is this? I kept staring at it for a while trying to figure it out but kept getting distracted by how ugly it looks. I eventually figured it turns the first JSON object into the second one:

```json
{
  "claude": { "label": "Claude Code", "extensionId": "anthropic.claude-code", "command": "claude-vscode.insertAtMention" },
  "codex": null,
  "my-agent": { "label": "My Agent", "command": "myAgent.addSelection" }
}
```

```json
[
  { "label": "Claude Code", "extensionId": "anthropic.claude-code", "command": "claude-vscode.insertAtMention", "id": "claude" },
  { "label": "My Agent", "command": "myAgent.addSelection", "id": "my-agent" }
]
```

And by "I eventually figured it out" I mean "I asked AI what it does".

I immediately changed my `AGENTS.md` to instruct it to write Go code, but in TypeScript. Which effectively means, write the code as dumb as you possibly can. Rob Pike [agrees](https://github.com/robpike/filter) with me. The following is longer, but paradoxically takes me less time to read it:

```ts
function configuredAgents(): AgentConfig[] {
  const agents = vscode.workspace
    .getConfiguration('addToAgentContext')
    .get<Record<string, Omit<AgentConfig, 'id'> | null>>('agents', {});

  const result: AgentConfig[] = [];
  for (const [id, agent] of Object.entries(agents)) {
    if (!agent || !agent.label || !agent.command) {
      continue;
    }
    result.push({ ...agent, id });
  }
  return result;
}
```

The type argument (`Record<string, Omit<AgentConfig, 'id'> | null>`) could use some work but hey, baby steps. Of course, I'm biased because I started with Go, but rants are fun. I don't even want to get started on the difference in toolchain experience.

## AI usage

These days an article wouldn't be complete without a section talking about AI. I normally don't write about this, but I also normally write technical articles, which this one isn't.

Probably the most common question would be: could I have fully vibe-coded it? Well, if AI can "solve" [Navier-Stokes](https://openai.com/index/navier-stokes-solution/) and "build" [C compilers](https://www.anthropic.com/engineering/building-c-compiler) autonomously, it can obviously build a simple VS Code extension. My proof of concept was fully vibe-coded and I actively used it while developing the extension further. However, I think the answer is heavily influenced by how you judge the end result and implicitly your level of interest. The question "is my extension ready to be used" doesn't have an objective answer, but I can explain mine.

I find there is a big difference between "I can see it works", "I understand what it does" and "I know it's done right". The first working version of this extension was the result of a single YOLO prompt. I could tell whether it worked or not, since I knew what experience I wanted as a user. I had no idea why it worked but as a user, I didn't care.

Then, I tried to understand what it does. I've been a developer for years now and would say I understand software fundamentals. However, I've never written a VS Code extension before and my experience with TypeScript is limited. I actually ended up spending some time reading about these topics online and a lot more time discussing them with my AI. Most of the code is generated, but I read through every single line and iterated through dozens of prompts and changes, perhaps more than I'd expect for a 500-line project. I changed and removed a lot of the early code, either because I found ways to simplify it, clean it up or just switched approaches. In the current version, I know what the code does and why it is written this way.

Still, I don't actually know if it's done right. The iterations weren't as much of a review from me as they were a learning experience. Everything makes sense to me since it follows general fundamentals, but those may differ from the specific guidelines of building a VS Code extension "properly". I'm not an expert and I don't have much interest in extension development, so all I can do really is ask AI why things were done in a certain way and try to reason about it. I may have AI challenge my opinions, but since they're uninformed I'm far from being as confident with the result as if it were, say, a Go project. Nevertheless, for my level of interest, I'm confident to say my extension is ready to be used.

Finally, I wouldn't have found the patience to finish this without AI, regardless of how much I like to rant about it. It's nice to have the option to choose what to care about and what to spend time on. In the end, it's just a tool like any other and sometimes maybe the best tool to pick for the parts you don't want to spend time on is a "skip" button. And if the time comes when you need to look under the "skip" button, it's good to know there's a "fast forward" button that can help you out.


It's been a while since I wrote my last article. A few days ago I
released my first VS Code extension, so it was a good opportunity for me
to get back to writing.

I normally write about technical topics, but this one is more personal.
I needed something "lighter" to get started, so sharing the
experience of building something and some of my recent frustrations felt
like a good start. If you're a developer, you may find things to relate
to. And this time, I also cover AI;)

I plan to write more and have a few articles coming up. For a while I've
been working on a red-black tree implementation in Golang and there's
so much to talk about there. If you have interest in technical topics,
follow me on Substack and Medium to read more.
