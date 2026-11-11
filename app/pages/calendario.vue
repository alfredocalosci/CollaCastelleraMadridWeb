<script lang="ts" setup>
  // import { popover } from '#build/ui';

  const { data: calendario } = await useFetch<CalendarEvent[]>('/api/calendario')

  watch(calendario, (val) => {
    console.log('calendario:', val)
  }, { immediate: true })

  const thisYear = new Date().getFullYear();
  const thisMonth = new Date().getMonth() + 1; // getMonth() returns 0-11
  const thisDay = new Date().getDate();

  const activeMonth = ref<number>(thisMonth);
  const activeYear = ref<number>(thisYear);
  const activeDay = ref<number>(thisDay);

  function handlePageChange(pages: { month: number; year: number }[]) {
    const page = pages[0]
    if (!page) return
    activeMonth.value = page.month
    activeYear.value = page.year
  }

  function handleDayMouseEnter(day: number | null) {
    activeDay.value = day ?? 0
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const attributes = ref<any[]>([
    {
      key: 'today',
      highlight: {color:'gray', fillMode:'outline'},
      dates: new Date(),
    },

    { 
      highlight: 'ccm-red',
      dates: ['2026-01-10', '2026-03-15', '2026-04-15', '2026-06-15', '2026-06-20'],
      popover: {
        label: 'Actuación programada',
        visibility: 'hover',
        hideIndicator: true,
      } 
    },

    { highlight: 'gray', dates: [ '2026-04-16'] },
  ]);

  const eventsTypes = [
    { name: 'ensayo', color: 'gray', text_class:'text-gray-700' },
    { name: 'ensayo especial', color: 'blue', text_class:'text-gray-700' },
    { name: 'actuación', color: 'ccm-red', text_class:'text-rosso-500' },
    { name: 'viaje', color: 'orange', text_class:'text-orange-500' },
    { name: 'otro', color: 'yellow', text_class:'text-yellow-400' },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const calendarAttributes = computed<any[]>(() => {
    if (!calendario.value) return []

    const todayObject = {
      key: 'today',
      highlight: {color:'gray', fillMode:'outline'},
      dates: new Date(),
    }

    const eventsObjects = calendario.value.map((item) => {
      const eventType = eventsTypes.find((type) => type.name === item.tipo)
      return {
        key: `event-${item.id}`,
        highlight: eventType ? eventType.color : 'blue',
        dates: new Date(item.fecha),
      }
    })

    return [todayObject, ...eventsObjects]

  })

  const thisMonthEvents = computed(() => {
    if (!calendario.value) return []
    return calendario.value.filter((item) => {
      const date = new Date(item.fecha)
      return date.getMonth() + 1 === activeMonth.value && date.getFullYear() === activeYear.value
    })
  })
    


  onMounted(() => {
    // console.log('calendarioByTipo:', calendarioByTipo.value)
    // console.log('calendarAttributes:', calendarAttributes.value)
    console.log('thisMonthEvents:', thisMonthEvents.value)
  })

</script>

<template>

  <div>
  
    <div class="bg-white">
      <section class="ccm_container pt-24 pb-12"> 
        <article class="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div class="order-last md:order-first">

            <h1 class="text-xl/6 uppercase font-display font-bold pb-4 mt-3 tracking-tight">Calendario <span class="text-rosso-500 text-3xl/6">.</span></h1>

            <article class="mt-8">
              
              <div 
                v-for="event in thisMonthEvents"
                :key="event.id"
                class="text-sm mb-2"
              >
                <div class="flex items-start  text-white ">
                  <h6 
                    class=" text-gray-700 font-bold font-display  min-w-14 mr-2"
                    
                  > <span class="pr-1" :class="eventsTypes.find(type => type.name === event.tipo)?.text_class">●</span> {{ veryShortWeekDays[parseDate(event.fecha).getDay()] }} {{ parseDate(event.fecha).getDate() }}</h6>

                  <h5 
                    class=" text-sm/4 text-gray-800 font-normal subpixel-antialiased "
                  ><span :class="activeDay == parseDate(event.fecha).getDate() ? 'text-black font-semibold' : ''">{{ event.nombre }}</span> <br/> 

                  <span class="text-gray-400 italic text-xs/4">  {{ event.lugar }} {{ event.hora }}</span></h5>
                </div>
              </div>


              
            </article>

          </div>

          <div class="md:col-span-2 order-first md:order-last">
            <client-only>
              <div class="ccm-calendar">
                <v-calendar expanded transparent borderless title-position="left"
                  :attributes="calendarAttributes"
                  :initial-page="{ month: thisMonth, year: thisYear }"
                  @update:pages="handlePageChange"
                  @daymouseenter="handleDayMouseEnter($event.day)"
                  @daymouseleave="handleDayMouseEnter(0)"
                />
              </div>
            </client-only>
          </div> 
              
        </article>
      </section>
    </div>

    <div>
      <section class="ccm_container pt-12 pb-24">
        <UButton
              to="https://tinyurl.com/CalendarioCCM2025"
              target="_blank" rel="noopener noreferrer"
              icon="mdi:arrow-top-right-thick"
              :ui="{ base: 'rounded-none' }"
              size="xl"
              class="bg-rosso-500 hover:bg-black transition-colors duration-300 text-white  shadow-lg w-full uppercase font-display cursor-pointer "
            >GOOGLE CALENDAR</UButton>
      </section>
    </div>

  </div>
</template>


<style scoped>
  @reference "tailwindcss";
  @reference "~/assets/css/main.css";

  .ccm-calendar :deep(.vc-container) {
    @apply font-display;
  }

  .ccm-calendar :deep(.vc-title) {
    @apply text-3xl/5 uppercase tracking-tight text-gray-400;
  }

  .ccm-calendar :deep(.vc-day-content) {
    @apply text-lg/5 tracking-tight font-bold h-full w-full rounded-none;
  }

  .ccm-calendar :deep(.vc-day) {
    @apply min-h-16 border-t border-gray-200;
  }

  .ccm-calendar :deep(.vc-day-content) {
    @apply justify-end items-start pt-3 pr-3;
  }

  .ccm-calendar :deep(.vc-weekdays) {
    @apply mb-6  pr-0;
  }

  .ccm-calendar :deep(.vc-weekday) {
    @apply text-gray-300 text-right pr-3;
  }

  .ccm-calendar :deep(.vc-weekday-1) {
    @apply text-rosso-500 ;
  }

  .ccm-calendar :deep(.vc-weekday-7) {
    @apply text-gray-500;
  }

  .ccm-calendar  :deep(.vc-container) {
    @apply rounded-none!;
  }

  .ccm-calendar  :deep(.vc-highlight) {
    @apply rounded-none! w-full h-full;
  }



  /* vc-header styles vc-weekdays */
  .ccm-calendar :deep(.vc-header ) {
    @apply mb-6;
  }





</style>