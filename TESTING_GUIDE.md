# InsightX Testing Guide

## Quick Start Testing

### 1. Start the Application

**Frontend** (Port 3000):
```bash
npm run dev
```

**Backend** (Already hosted):
- Production: https://insightx-bkend.onrender.com
- No need to start locally

### 2. Upload a Dataset

1. Navigate to http://localhost:3000/connect
2. Upload a CSV file (e.g., transactions.csv, sales.csv)
3. Wait for Data DNA analysis to complete
4. Click "Start Analysis" to enter workspace

### 3. Test the Orchestration System

#### Test Case 1: Simple SQL Query
```
Query: "What's the average transaction amount?"

Expected Flow:
1. Orchestrator classifies as SQL_ONLY
2. SQL Agent executes query
3. Composer returns structured JSON with:
   - Text explanation
   - Metrics (average, count, etc.)
   - Optional chart
   - Follow-up questions
   - SQL query

Expected UI:
✅ Markdown text with bold numbers
✅ Metric cards showing key values
✅ Chart (if applicable)
✅ Confidence badge
✅ Clickable follow-up pills
✅ Collapsible SQL query section
✅ SQL query in sidebar history
```

#### Test Case 2: Statistical Analysis
```
Query: "Which categories are statistical outliers?"

Expected Flow:
1. Orchestrator classifies as SQL_THEN_PY
2. SQL Agent aggregates data
3. Python Agent calculates z-scores
4. Composer synthesizes results

Expected UI:
✅ Detailed explanation with statistics
✅ Metrics (outliers, z-scores, p-values)
✅ Chart showing outliers
✅ High confidence (90%+)
✅ Follow-up questions
✅ SQL query in sidebar
```

#### Test Case 3: Python Analysis
```
Query: "Run a linear regression to predict revenue"

Expected Flow:
1. Orchestrator classifies as PY_ONLY
2. Python Agent executes ML code
3. Composer presents results

Expected UI:
✅ Explanation of model
✅ Metrics (R², coefficients, predictions)
✅ Chart showing predictions
✅ Confidence score
✅ Follow-up questions
✅ No SQL in sidebar (Python only)
```

#### Test Case 4: Explanation
```
Query: "What columns are in this dataset?"

Expected Flow:
1. Orchestrator classifies as EXPLAIN_ONLY
2. Explainer Agent reads Data DNA
3. Returns plain text response

Expected UI:
✅ Plain markdown text
✅ No structured JSON
✅ No charts or metrics
✅ No follow-ups
```

### 4. Test Follow-up Questions

1. Ask a question that generates follow-ups
2. Click one of the follow-up pills
3. Verify:
   - ✅ Question fills input field
   - ✅ Question auto-submits
   - ✅ New response appears
   - ✅ New follow-ups generated

### 5. Test SQL History

1. Run multiple SQL queries
2. Check sidebar for SQL History panel
3. Verify:
   - ✅ Last 5 queries visible
   - ✅ Long queries truncated
   - ✅ Hover shows full query
   - ✅ Panel only visible when queries exist

### 6. Test Toast Notifications

1. Submit a query
2. Watch for toast notifications
3. Verify:
   - ✅ Toasts appear above navbar
   - ✅ Width is appropriate (400px)
   - ✅ Z-index is correct (not behind navbar)
   - ✅ Agent selection toasts show
   - ✅ Tool execution toasts show

---

## Common Issues & Solutions

### Issue: Composer Returns Plain Text Instead of JSON
**Symptom**: Response shows as plain markdown, no charts/metrics
**Solution**: Check backend logs. Composer may not be following prompt. Verify system prompt in `lib/agents/config.ts`

### Issue: Charts Not Rendering
**Symptom**: Metrics show but no chart
**Solution**: 
1. Check browser console for errors
2. Verify chart_spec has correct structure
3. Ensure data array is not empty
4. Check xAxis/yAxis field names match data

### Issue: Follow-ups Not Clickable
**Symptom**: Pills show but don't respond to clicks
**Solution**: Check that `onFollowUpClick` prop is passed through all components

### Issue: SQL History Not Showing
**Symptom**: Queries execute but sidebar empty
**Solution**: 
1. Verify `sql_result` events are received
2. Check `sqlHistory` state in workspace page
3. Ensure WorkspaceLayout passes prop to sidebar

### Issue: Toast Behind Navbar
**Symptom**: Toast notifications hidden by navbar
**Solution**: Check `components/ui/toast-provider.tsx` has `zIndex: 9999` and `top: 20`

---

## Browser Console Checks

### Expected Logs
```
[Orchestrator] Intent Classified: SQL_ONLY
[Tool] SQL Analysis Executed
[Orchestrator] Final response received
```

### Error Logs to Watch For
```
❌ Failed to parse Composer response
❌ Missing required field: text
❌ Chart data is empty
❌ Follow-up handler not defined
```

---

## API Health Check

### Test Backend Connection
```bash
curl https://insightx-bkend.onrender.com/health
```

Expected Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-..."
}
```

### Test SQL Execution
```bash
curl -X POST https://insightx-bkend.onrender.com/api/sql/execute \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-session-id",
    "query": "SELECT COUNT(*) FROM transactions"
  }'
```

---

## Performance Benchmarks

### Expected Response Times
- Orchestrator classification: < 2 seconds
- SQL query execution: < 3 seconds
- Python analysis: < 5 seconds
- Composer synthesis: < 3 seconds
- Total end-to-end: < 10 seconds

### Toast Notification Timing
- Agent selection: Immediate (< 100ms)
- Tool execution: After tool completes
- Final response: After Composer finishes

---

## Test Dataset Recommendations

### Good Test Datasets
1. **E-commerce Transactions** (transactions.csv)
   - Columns: date, amount, category, state, payment_method
   - Good for: Aggregations, trends, outliers

2. **Sales Data** (sales.csv)
   - Columns: date, product, quantity, revenue, region
   - Good for: Time series, predictions, comparisons

3. **User Analytics** (users.csv)
   - Columns: user_id, signup_date, activity_count, device
   - Good for: Cohort analysis, retention, segmentation

### Avoid
- Datasets with < 100 rows (too small for meaningful analysis)
- Datasets with > 1M rows (may timeout)
- Datasets with only text columns (limited analysis options)

---

## Success Checklist

Before marking as complete, verify:

- [ ] Can upload dataset successfully
- [ ] Data DNA generates correctly
- [ ] Orchestrator classifies queries correctly
- [ ] SQL queries execute and return results
- [ ] Python scripts execute and return results
- [ ] Composer returns structured JSON
- [ ] Charts render with real data
- [ ] Metrics display correctly
- [ ] Follow-up questions are clickable
- [ ] Follow-ups auto-submit
- [ ] SQL history appears in sidebar
- [ ] Toast notifications show above navbar
- [ ] No TypeScript errors
- [ ] No runtime errors in console
- [ ] Response time < 10 seconds

---

## Next Steps After Testing

1. **Document Issues**: Create GitHub issues for any bugs found
2. **Performance Optimization**: Profile slow queries
3. **UI Polish**: Refine chart colors, spacing, animations
4. **Error Handling**: Add user-friendly error messages
5. **Persistence**: Save SQL history to database
6. **Export**: Add ability to export charts/results

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Check backend logs (if accessible)
3. Verify `.env.local` has correct backend URL
4. Ensure all dependencies are installed (`npm install`)
5. Try clearing browser cache and restarting dev server

**Backend URL**: https://insightx-bkend.onrender.com
**Frontend URL**: http://localhost:3000
