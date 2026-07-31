# Digital Marketing + Postiz MCP

## ALL SET START (1 command)

Apni machine par (jahan Postiz chal raha hai):

```bash
export POSTIZ_API_KEY="your-api-key"
npm start
```

Agar `ALL SET START` dikhe, Cursor mein seedha likho:

- "Mere connected social accounts dikhao"
- "Kal 10 baje LinkedIn par post schedule karo"

---

## MCP Config (already done)

`.cursor/mcp.json` mein Postiz configured hai:

- **HTTP:** `http://localhost:4007/api/mcp`
- **stdio:** `postiz-mcp` npm package

Cursor restart karo after setting `POSTIZ_API_KEY`.

---

## Cloud Agent

```bash
npm run tunnel:postiz
```

Tunnel URL ko [cursor.com/agents](https://cursor.com/agents) MCP dropdown mein add karo.

---

## Postiz MCP Tools (9)

| Tool | Kaam |
|---|---|
| `integrationList` | Connected accounts |
| `groupList` | Groups/customers |
| `integrationSchema` | Platform rules |
| `triggerTool` | Platform helpers |
| `schedulePostTool` | Schedule/publish posts |
| `generateImageTool` | AI images |
| `generateVideoOptions` | Video options |
| `videoFunctionTool` | Video settings |
| `generateVideoTool` | Generate videos |
