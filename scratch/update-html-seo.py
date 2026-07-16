import re

def update_file(filename, keys_prefix, is_main=False):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # For index.html
    if is_main:
        desc_key = "meta.desc"
        keywords_key = "meta.keywords"
        desc_val = "Тетернік Олег Олександрович — лікар-ендоскопіст, хірург, УЗД. Відгуки пацієнтів. Тетерник Олег Александрович — отзывы пациентов, ендоскопія, ФГДС, колоноскопія, видалення поліпів у Харкові."
        keywords_val = "ФГДС, зонд Харків, ковтнути кишку, гастроскопія Харків, колоноскопія Харків, видалення поліпів кишечника, УЗД черевної порожнини, седація, медикаментозний сон, Тетернік Олег, ендоскопія Харків, ВГДС"
    else:
        desc_key = f"{keys_prefix}.meta.desc"
        keywords_key = f"{keys_prefix}.meta.keywords"
        
        if keys_prefix == "service.gastro":
            desc_val = "Детальна підготовка до гастроскопії (ФГДС, зонд шлунка) в Харкові. Інструкції лікаря Тетерніка О.О.: як ковтнути кишку без болю під седацією (наркозом)."
            keywords_val = "ФГДС, зонд Харків, ковтнути кишку, гастроскопія Харків, зонт шлунка, рак шлунку, кила стравоходу, грижа стравоходу, пухлина стравоходу, язва дванадцятипалої кишки, седація, медикаментозний сон, підготовка"
        elif keys_prefix == "service.colono":
            desc_val = "Як підготуватися до колоноскопії препаратом Ізіклін. Детальна інструкція лікаря-ендоскопіста Тетерніка О.О. про огляд кишечника під наркозом (седацією)."
            keywords_val = "колоноскопія, колоноскопія седація, колоноскопия наркоз, підготовка до колоноскопії, Ізіклін, рак товстої кишки, рак кишечника, пухлина кишечника, поліпи кишечника"
        elif keys_prefix == "service.uzd":
            desc_val = "Ультразвукова діагностика (УЗД) черевної порожнини, нирок та сечового міхура в Харкові. Безпечне та безболісне обстеження внутрішніх органів у лікаря Тетерніка О.О."
            keywords_val = "УЗД черевної порожнини, узд органів, ультразвукова діагностика Харків, підготовка до узд, УЗД нирок, УЗД щитоподібної залози, Тетернік Олег"
        elif keys_prefix == "service.surgery":
            desc_val = "Оперативна ендоскопія та малоінвазивна хірургія в Харкові. Видалення поліпів кишечника (поліпектомія), зупинка кровотеч, гастростома, лікування пухлин та ЕРХПГ."
            keywords_val = "видалення поліпів кишечника, поліпектомія, оперативна ендоскопія, малоінвазивна хірургія, ЕРХПГ, жовтяниця, капсульна ендоскопія, гастростома, ендоскопічна гастростома, Тетернік"

    # Replace meta description
    content = re.sub(
        r'<meta name="description" content="[^"]*">',
        f'<meta name="description" data-i18n-content="{desc_key}" content="{desc_val}">',
        content
    )
    # Replace meta keywords
    content = re.sub(
        r'<meta name="keywords" content="[^"]*">',
        f'<meta name="keywords" data-i18n-content="{keywords_key}" content="{keywords_val}">',
        content
    )
    
    # Save the updated content
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated SEO tags in {filename}")

update_file('index.html', '', is_main=True)
update_file('gastroscopy.html', 'service.gastro')
update_file('colonoscopy.html', 'service.colono')
update_file('uzd.html', 'service.uzd')
update_file('surgery.html', 'service.surgery')
