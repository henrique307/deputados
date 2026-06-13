import { Component, Input } from '@angular/core';
import { fmtBRL, formatCpfCnpj, nomeMes } from '../../lib/format';

@Component({
  selector: 'app-deputado-card',
  imports: [],
  templateUrl: './deputado-card.html',
  styleUrl: './deputado-card.css',
})
export class DeputadoCard {
  @Input({ required: true })
  d!: DeputadoDespesas;

  @Input({ required: true })
  rank!: number;

  @Input({ required: true })
  max!: number;

  open = false;
  fmtBRL = fmtBRL
  formatCpfCnpj = formatCpfCnpj;
  
  toggle(): void {
    this.open = !this.open;
  }

  get pct(): number {
    return Math.max(4, (this.d.totalGeral / this.max) * 100);
  }

  get tipos() {
    return Object.entries(this.d.porTipoDespesa).sort((a, b) => b[1].total - a[1].total);
  }

  get meses() {
    return Object.entries(this.d.porMes).sort((a, b) => a[0].localeCompare(b[0]));
  }

  nomeMes = nomeMes

  hideImage(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.visibility = 'hidden';
  }
}
