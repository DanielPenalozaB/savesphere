Hola pana, ya implementé el fetch de real-time junto con el histórico. Te explico cómo funciona ahora:

**Histórico (bulk de 48h):** Se hace con granularidad PT10M (un data point cada 10 minutos). Conviva tiene un límite de 24h por request para granularidades minutely, así que se parte en 2 chunks de 24h.

**Real-time (últimos 15 min):** Se hace con granularidad PT1M (un data point cada minuto). Este es el único granularity que soporta el endpoint real-time de Conviva — PT10M, PT5M, PT3M todos regresan 0 puntos.

**Resultado en el chart:** La mayor parte de la gráfica (48h) va a tener resolución de 10 minutos, pero los últimos ~15 minutos van a tener resolución de 1 minuto. Ambos requests se hacen en paralelo, se mergean y se deduplican por timestamp. Esto cubre el gap de ~15-20 min que tenía el histórico donde no aparecía data reciente.

En resumen: la granularidad NO es uniforme — es PT10M para el histórico y PT1M para el real-time. Es una limitación de Conviva, no hay forma de pedir PT10M en real-time.
