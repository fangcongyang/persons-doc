
## 常用sql

+ 查询插入

```sql
INSERT INTO employees_archive (employee_id, first_name, last_name)
SELECT employee_id, first_name, last_name
FROM employees
WHERE department_id = 20;
```