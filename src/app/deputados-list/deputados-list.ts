import { Component, Input } from '@angular/core';
import { Despesa } from '../../data/deputados';
import { DeputadoCard } from '../deputado-card/deputado-card';
import { LucideAngularModule, Search } from 'lucide-angular';
import { FormsModule } from '@angular/forms';

type Sort = 'maior' | 'menor' | 'az';

@Component({
  selector: 'app-deputados-list',
  templateUrl: './deputados-list.html',
  imports: [DeputadoCard, FormsModule, LucideAngularModule],
})
export class DeputadosList {
  @Input({ required: true })
  deputados: Despesa[] = [];

  q = '';
  sort: Sort = 'maior';
  readonly Search = Search;

  readonly sortOptions: [Sort, string][] = [
    ['maior', 'Maior gasto'],
    ['menor', 'Menor gasto'],
    ['az', 'A–Z'],
  ];

  get filtrados(): Despesa[] {
    const term = this.q.trim().toLowerCase();

    const base = term
      ? this.deputados.filter((d) => d.nome.toLowerCase().includes(term))
      : [...this.deputados];

    return base.sort((a, b) => {
      if (this.sort === 'maior') {
        return b.totalGeral - a.totalGeral;
      }

      if (this.sort === 'menor') {
        return a.totalGeral - b.totalGeral;
      }

      return a.nome.localeCompare(b.nome, 'pt-BR');
    });
  }

  get max(): number {
    return Math.max(...this.deputados.map((d) => d.totalGeral), 1);
  }

  trackByDeputado(_: number, deputado: Despesa): number {
    return deputado.id;
  }
}
