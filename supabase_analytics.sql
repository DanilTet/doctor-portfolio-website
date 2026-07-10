-- Обновленная функция для правильного учета всех метрик (уникальные посетители, география, скролл, клики)

create or replace function public.track_analytics_event(
  p_event_type text,
  p_event_target text default null,
  p_scroll_depth integer default null,
  p_time_on_site integer default null,
  p_is_new_visitor boolean default false,
  p_is_returning boolean default false,
  p_utm_source text default null,
  p_city text default null,
  p_os text default null,
  p_browser text default null,
  p_device text default null,
  p_referrer text default null
) returns void
language plpgsql
security definer
as $$
declare
  today date := CURRENT_DATE;
begin
  -- Убедимся, что запись для сегодняшнего дня существует
  insert into public.daily_analytics (date)
  values (today)
  on conflict (date) do nothing;

  -- Обновляем счетчики
  update public.daily_analytics
  set 
    -- Просмотры страниц
    pageviews = pageviews + case when p_event_type = 'pageview' then 1 else 0 end,
    
    -- Уникальные и возвращающиеся посетители
    unique_visitors = unique_visitors + case when p_is_new_visitor then 1 else 0 end,
    returning_visitors = returning_visitors + case when p_is_returning then 1 else 0 end,
    
    -- Скролл
    total_scroll_depth = total_scroll_depth + coalesce(p_scroll_depth, 0),
    scroll_events = scroll_events + case when p_scroll_depth is not null then 1 else 0 end,
    
    -- Время на сайте
    total_time_on_site = total_time_on_site + coalesce(p_time_on_site, 0),
    time_events = time_events + case when p_time_on_site is not null then 1 else 0 end,

    -- JSONB: источники трафика (только при pageview)
    utm_sources = case when p_utm_source is not null and p_event_type = 'pageview' then
      jsonb_set(utm_sources, array[p_utm_source], to_jsonb(coalesce((utm_sources->>p_utm_source)::int, 0) + 1))
    else utm_sources end,

    -- JSONB: города (только при pageview)
    cities = case when p_city is not null and p_event_type = 'pageview' then
      jsonb_set(cities, array[p_city], to_jsonb(coalesce((cities->>p_city)::int, 0) + 1))
    else cities end,

    -- JSONB: операционные системы (только при pageview)
    os = case when p_os is not null and p_event_type = 'pageview' then
      jsonb_set(os, array[p_os], to_jsonb(coalesce((os->>p_os)::int, 0) + 1))
    else os end,

    -- JSONB: браузеры (только при pageview)
    browsers = case when p_browser is not null and p_event_type = 'pageview' then
      jsonb_set(browsers, array[p_browser], to_jsonb(coalesce((browsers->>p_browser)::int, 0) + 1))
    else browsers end,

    -- JSONB: устройства (только при pageview)
    devices = case when p_device is not null and p_event_type = 'pageview' then
      jsonb_set(devices, array[p_device], to_jsonb(coalesce((devices->>p_device)::int, 0) + 1))
    else devices end,

    -- JSONB: рефереры (только при pageview)
    referrers = case when p_referrer is not null and p_event_type = 'pageview' then
      jsonb_set(referrers, array[p_referrer], to_jsonb(coalesce((referrers->>p_referrer)::int, 0) + 1))
    else referrers end,

    -- JSONB: клики (только при кликах)
    clicks = case when p_event_type = 'click' and p_event_target is not null then
      jsonb_set(clicks, array[p_event_target], to_jsonb(coalesce((clicks->>p_event_target)::int, 0) + 1))
    else clicks end

  where date = today;
end;
$$;
