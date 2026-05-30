import { getOpenAITools, executeToolByName } from '@/lib/ai-tools';

const ZAI_API_KEY = '9fd42f5cf2df48f4955f77a48519150a.Hd427mUP8G9YWYMe';
const ZAI_URL = 'https://api.z.ai/api/coding/paas/v4';

export async function testXmlParsing(userId: string) {
  const results: string[] = [];

  const tools = getOpenAITools();

  const firstMessages = [
    { role: 'system', content: 'Date actuelle : vendredi 29 mai 2026. Tu es un assistant utile.' },
    { role: 'user', content: 'Cherche une recette de paella végétarienne' },
  ];

  results.push('=== FIRST CALL ===');
  const firstBody = {
    model: 'glm-4.5-air',
    messages: firstMessages,
    temperature: 0.7,
    max_tokens: 500,
    tools,
    tool_choice: 'auto',
  };

  const firstRes = await fetch(`${ZAI_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ZAI_API_KEY}` },
    body: JSON.stringify(firstBody),
  });
  const firstData = await firstRes.json();
  const firstMessage = firstData.choices?.[0]?.message;
  results.push(`finish_reason: ${firstData.choices?.[0]?.finish_reason}`);
  results.push(`content: ${JSON.stringify(firstMessage?.content || '').slice(0, 300)}`);
  results.push(`tool_calls: ${JSON.stringify(firstMessage?.tool_calls || 'none')}`);

  // Try to parse tool calls
  const content = firstMessage?.content || '';
  const xmlRegex = /<tool_call>([\s\S]*?)<\/tool_call>/g;
  let xmlMatch;
  let found = 0;
  while ((xmlMatch = xmlRegex.exec(content)) !== null) {
    found++;
    const inner = xmlMatch[1].trim();
    const nameMatch = inner.match(/^(\w+)/);
    const name = nameMatch?.[1] || '';
    const args: Record<string, any> = {};
    const argRegex = /<arg_key>(\w+)<\/arg_key>\s*<arg_value>([\s\S]*?)<\/arg_value>/g;
    let argMatch;
    while ((argMatch = argRegex.exec(inner)) !== null) {
      args[argMatch[1]] = argMatch[2].trim();
    }
    results.push(`XML TOOL #${found}: name=${name}, args=${JSON.stringify(args)}`);

    if (name) {
      const toolResult = await executeToolByName(name, args, userId);
      results.push(`RESULT: ${toolResult.slice(0, 500)}`);

      // Second call
      results.push('\n=== SECOND CALL ===');
      const secondMessages = [
        ...firstMessages,
        { role: 'user', content: `Suite à ta demande d'outil, voici le résultat. Formule une réponse naturelle à partir de ces informations :\n${toolResult}` },
      ];

      const secondBody = {
        model: 'glm-4.5-air',
        messages: secondMessages,
        temperature: 0.7,
        max_tokens: 500,
      };

      const secondRes = await fetch(`${ZAI_URL}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ZAI_API_KEY}` },
        body: JSON.stringify(secondBody),
      });
      const secondData = await secondRes.json();
      const secondContent = secondData.choices?.[0]?.message?.content || '';
      results.push(`second finish_reason: ${secondData.choices?.[0]?.finish_reason}`);
      results.push(`second response: ${secondContent.slice(0, 500)}`);
    }
  }

  results.push(`XML tool blocks found: ${found}`);
  return results.join('\n');
}
