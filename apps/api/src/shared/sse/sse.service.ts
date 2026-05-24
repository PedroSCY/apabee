import { Injectable } from '@nestjs/common'
import { Observable, Subject } from 'rxjs'
import { SseEvent, SseEventTipo } from './sse.types'

@Injectable()
export class SseService {
  private readonly subject = new Subject<SseEvent>()

  emit(tipo: SseEventTipo, id?: string, dados?: Record<string, unknown>): void {
    this.subject.next({ tipo, id, timestamp: new Date().toISOString(), dados })
  }

  asObservable(): Observable<SseEvent> {
    return this.subject.asObservable()
  }
}
