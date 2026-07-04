// ─────────────────────────────────────────────
// PROJECT DATA, extensible, add as many as you want.
// Each project has a slug for routing.
// ─────────────────────────────────────────────

const PROJECTS = [
  {
    slug: 'cryptostream-ai',
    num: '01',
    title: 'CryptoStream',
    titleIt: 'AI',
    year: '2024',
    role: 'Solo build',
    category: 'Data · Streaming',
    summary: 'Real-time crypto pipeline ingesting Coinbase feeds at scale.',
    desc: 'Real-time data pipeline ingesting Coinbase feeds at scale. Kafka and Spark for transport and processing, Cassandra for durable storage, Streamlit and Grafana for dashboards. Forecasts via LSTM, ARIMA, VAR, and moving averages. All containerized.',
    stack: ['Kafka', 'Spark', 'Cassandra', 'Streamlit', 'Grafana', 'Docker', 'Python'],
    links: { github: 'https://github.com/isiddharthsingh/CryptoStream-AI' },
    highlights: [
      'Engineered a real-time data pipeline using Apache Kafka, Spark, and Cassandra to process, transform, and store high-velocity streaming data from the Coinbase API, enabling low-latency querying.',
      'Developed interactive dashboards in Streamlit and Grafana, integrating LSTM, ARIMA, VAR, and moving-average forecasting models.',
      'Deployed a scalable solution using Docker.',
    ],
    accent: 'terminal',
  },
  {
    slug: 'taleweaver',
    num: '02',
    title: 'Tale',
    titleIt: 'weaver',
    year: '2024',
    role: 'Solo build',
    category: 'AI · Multimodal',
    summary: 'Image-to-story generation on a serverless AWS backend.',
    desc: 'Multimodal AI app that turns a photo into a generated short story. AWS Rekognition for vision, OpenAI for narrative, Lambda + DynamoDB serverless backend, Cognito-gated, exposed via API Gateway.',
    stack: ['AWS Rekognition', 'OpenAI', 'EC2', 'Lambda', 'DynamoDB', 'Cognito', 'API Gateway'],
    links: { github: 'https://github.com/isiddharthsingh/Taleweaver' },
    highlights: [
      'Built an AI-driven application leveraging AWS Rekognition and OpenAI for image recognition, NLP, and story generation, hosted on AWS EC2 with a serverless Lambda backend.',
      'Streamlined user auth and data management with AWS Cognito, DynamoDB, and API Gateway, secure, low-latency RESTful API.',
    ],
    accent: 'story',
  },
  {
    slug: 'dining-concierge',
    num: '03',
    title: 'Dining',
    titleIt: 'Concierge',
    year: '2023',
    role: 'Solo build',
    category: 'AI · Conversational',
    summary: 'Serverless NLP chatbot for restaurant recommendations.',
    desc: 'NLP-driven serverless chatbot for restaurant recs. Lex + Lambda + API Gateway on the front, with SQS, ElasticSearch, DynamoDB, and SES orchestrated by CloudWatch on the back.',
    stack: ['AWS Lex', 'Lambda', 'API Gateway', 'DynamoDB', 'ElasticSearch', 'SES', 'SQS'],
    links: { github: 'https://github.com/isiddharthsingh' },
    highlights: [
      'Designed and deployed a serverless, microservices-based Dining Concierge chatbot using AWS Lex, Lambda, API Gateway, and S3, leveraging NLP for personalized restaurant recommendations.',
      'Automated restaurant suggestion workflows by 50% via SQS, ElasticSearch, DynamoDB, and SES, orchestrated with CloudWatch events.',
    ],
    accent: 'dining',
  },
];

Object.assign(window, { PROJECTS });
