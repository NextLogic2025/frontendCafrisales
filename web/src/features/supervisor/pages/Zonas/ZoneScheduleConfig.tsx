import { Switch } from '@headlessui/react'
import { type ZoneSchedule } from '../../services/zonasApi'

interface ZoneScheduleConfigProps {
    schedules: ZoneSchedule[]
    onChange: (schedules: ZoneSchedule[]) => void
}

const DAYS = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado'
]

export function ZoneScheduleConfig({ schedules, onChange }: ZoneScheduleConfigProps) {

    const handleToggle = (dayIndex: number, field: 'entregasHabilitadas' | 'visitasHabilitadas') => {
        const newSchedules = [...schedules]
        const scheduleIndex = newSchedules.findIndex(s => s.diaSemana === dayIndex)

        if (scheduleIndex >= 0) {
            newSchedules[scheduleIndex] = {
                ...newSchedules[scheduleIndex],
                [field]: !newSchedules[scheduleIndex][field]
            }
        } else {
            // Create if doesn't exist (though usually we initialize all days)
            newSchedules.push({
                diaSemana: dayIndex,
                entregasHabilitadas: field === 'entregasHabilitadas',
                visitasHabilitadas: field === 'visitasHabilitadas'
            })
        }
        onChange(newSchedules)
    }

    const getSchedule = (dayIndex: number) => {
        return schedules.find(s => s.diaSemana === dayIndex) || {
            diaSemana: dayIndex,
            entregasHabilitadas: false,
            visitasHabilitadas: false
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h3 className="font-semibold text-lg text-gray-900">Horarios</h3>
                <p className="text-sm text-gray-500">Configura entregas y visitas por día.</p>
            </div>

            <div className="grid gap-4">
                {DAYS.map((dayName, index) => {
                    const schedule = getSchedule(index)
                    return (
                        <div key={index} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                            <div className="space-y-1">
                                <span className="font-semibold text-gray-900 block">{dayName}</span>
                                <span className="text-xs text-gray-400">Entrega y visita</span>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Entrega</span>
                                    <Switch
                                        checked={schedule.entregasHabilitadas}
                                        onChange={() => handleToggle(index, 'entregasHabilitadas')}
                                        className={`${schedule.entregasHabilitadas ? 'bg-green-500' : 'bg-gray-200'
                                            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-red/20`}
                                    >
                                        <span
                                            className={`${schedule.entregasHabilitadas ? 'translate-x-6' : 'translate-x-1'
                                                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                        />
                                    </Switch>
                                </div>

                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Visita</span>
                                    <Switch
                                        checked={schedule.visitasHabilitadas}
                                        onChange={() => handleToggle(index, 'visitasHabilitadas')}
                                        className={`${schedule.visitasHabilitadas ? 'bg-green-500' : 'bg-gray-200'
                                            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-red/20`}
                                    >
                                        <span
                                            className={`${schedule.visitasHabilitadas ? 'translate-x-6' : 'translate-x-1'
                                                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                        />
                                    </Switch>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
