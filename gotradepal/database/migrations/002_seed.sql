INSERT INTO courses (title, description, skill_tags, difficulty, duration_minutes) VALUES
('Budgeting Foundations','Build a practical spending plan and emergency fund.',ARRAY['finance','budgeting'],'beginner',45),
('Digital Freelancing','Package skills, price services, and find clients.',ARRAY['career','freelance'],'beginner',60),
('AI for Small Business','Use AI tools to validate and grow a micro-business.',ARRAY['ai','business'],'intermediate',75);

INSERT INTO opportunities (type,title,description,country,remote,required_skills,value_estimate,source_url) VALUES
('project','Remote Virtual Assistant Project','Support a growing startup with scheduling and operations.',NULL,true,ARRAY['communication','operations'],500,'https://example.com/opportunities/va'),
('business','Local Delivery Microbusiness','Launch a neighborhood delivery coordination service.',NULL,false,ARRAY['sales','operations'],1200,'https://example.com/opportunities/delivery'),
('job','Junior Data Analyst','Entry role for spreadsheet and SQL learners.',NULL,true,ARRAY['excel','sql'],30000,'https://example.com/opportunities/data-analyst');
