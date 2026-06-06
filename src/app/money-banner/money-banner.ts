import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  NgZone,
  OnChanges,
  PLATFORM_ID,
  SimpleChanges,
} from '@angular/core';
import { fmtBRL } from '../../lib/format';

@Component({
  selector: 'app-money-banner',
  templateUrl: './money-banner.html',
})
export class MoneyBanner implements OnChanges {
  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  @Input() total = 0;
  @Input() mesRef = '';
  @Input() qtdDeputados = 0;

  fmtBRL = fmtBRL

  shown = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['total']) {
      this.animateTotal();
    }
  }

  private animateTotal() {
    if (!isPlatformBrowser(this.platformId)) {
      this.shown = this.total;
      return;
    }

    const start = performance.now();
    const duration = 1800;

    this.ngZone.runOutsideAngular(() => {
      const tick = (time: number) => {
        const progress = Math.min(1, (time - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);

        this.shown = this.total * eased;
        this.cdr.detectChanges(); // avisa o Angular frame a frame

        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    });
  }

  nomeMes(mesRef: string): string {
    const date = new Date(mesRef);

    return date.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });
  }

  stats = [
    { l: 'Combustível', v: '≈ 8%' },
    { l: 'Divulgação', v: '≈ 31%' },
    { l: 'Passagens', v: '≈ 22%' },
    { l: 'Consultorias', v: '≈ 14%' },
  ];
}
