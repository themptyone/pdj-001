// js/api.js
async function generateInsights() {
    const insightsContent = document.getElementById('insights-content');
    const generateBtn = document.getElementById('generate-insights-btn');
    
    let apiKey = data.settings.apiKey;
    if (!apiKey || apiKey === "PASTE_YOUR_GEMINI_API_KEY_HERE") {
        insightsContent.innerHTML = `<p style="color: var(--accent-color-warning);">Please add your Gemini API key in the Settings page to use this feature.</p>`;
        return;
    }

    insightsContent.innerHTML = '<div class="loader"></div> <p style="text-align:center;">Gemini is analyzing your finances...</p>';
    generateBtn.disabled = true;

    const financialData = {
        income: data.income.filter(i => !i.isHidden),
        expenses: data.expenses.filter(e => !e.isHidden),
        fixedExpenses: data.fixedExpenses.filter(f => !f.isHidden),
        debts: data.debts.filter(d => !d.isHidden),
        goals: data.goals.filter(g => !g.isHidden),
        allocation: data.settings.allocation
    };

    const prompt = `
        You are a helpful and insightful financial assistant. Analyze the following financial data for a user in Montreal, Canada. The current date is August 16, 2025.
        Provide a detailed analysis with predictions and actionable advice.
        The data is: ${JSON.stringify(financialData)}
    `;

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    "financialHealth": {
                        type: "OBJECT",
                        properties: {
                            "score": { "type": "NUMBER" },
                            "summary": { "type": "STRING" }
                        }
                    },
                    "spendingForecast": {
                        type: "OBJECT",
                        properties: {
                            "next30Days": { "type": "NUMBER" },
                            "comment": { "type": "STRING" }
                        }
                    },
                    "goalEstimates": {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                "goalTitle": { "type": "STRING" },
                                "estimatedCompletionDate": { "type": "STRING" }
                            }
                        }
                    },
                    "recommendations": {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                "title": { "type": "STRING" },
                                "description": { "type": "STRING" }
                            }
                        }
                    }
                }
            }
        }
    };

    try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (result.candidates && result.candidates.length > 0) {
            const jsonText = result.candidates[0].content.parts[0].text;
            const insights = JSON.parse(jsonText);
            renderInsights(insights);
        } else {
            throw new Error("No insights returned from API.");
        }

    } catch (error) {
        insightsContent.innerHTML = `<p style="color: var(--accent-color-negative);">Error: Could not generate insights. ${error.message}</p>`;
    } finally {
        generateBtn.disabled = false;
    }
}

function renderInsights(insights) {
    const insightsContent = document.getElementById('insights-content');
    insightsContent.innerHTML = `
        <div class="insights-grid">
            <div class="insight-card">
                <h3>Financial Health</h3>
                <p>Your score is <span class="highlight">${insights.financialHealth.score}/100</span></p>
                <p>${insights.financialHealth.summary}</p>
            </div>
            <div class="insight-card">
                <h3>Spending Forecast</h3>
                <p>Estimated spending for the next 30 days: <span class="highlight">$${insights.spendingForecast.next30Days.toFixed(2)}</span></p>
                <p>${insights.spendingForecast.comment}</p>
            </div>
            <div class="insight-card">
                <h3>Goal Estimates</h3>
                <ul>
                    ${insights.goalEstimates.map(goal => `<li><strong>${goal.goalTitle}:</strong> Estimated completion by ${goal.estimatedCompletionDate}.</li>`).join('')}
                </ul>
            </div>
             <div class="insight-card">
                <h3>Recommendations</h3>
                <ul>
                   ${insights.recommendations.map(rec => `<li><strong>${rec.title}:</strong> ${rec.description}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
}