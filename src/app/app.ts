import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import deputas from '../../resumoDaFestaDasPutas.json';
import { CommonModule, CurrencyPipe, PercentPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

export interface DespesaData {
  totalGeral: number;
  quantidadeDespesas: number;
  nome: string;
  email: string;
  urlFoto: string;
  porMes: Record<string, number>;
  porTipoDespesa: Record<string, { total: number; quantidade: number }>;
  porFornecedor: Record<string, { total: number; quantidade: number; cnpjCpfFornecedor: string }>;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, CurrencyPipe, PercentPipe, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('deputas_webapp');

  pesquisa = new FormControl('');
  deputas: any[] = deputas.sort((a, b) => b.totalGeral - a.totalGeral);

  initials(deputa: DespesaData): string {
    return deputa.nome
      .split(' ')
      .filter((n) => n.length > 2)
      .slice(0, 2)
      .map((n) => n[0])
      .join('');
  }

  get filteredItems() {
    const term = this.pesquisa.value?.toLowerCase() ?? '';

    return this.deputas.filter((deputa) => deputa.nome.toLowerCase().includes(term));
  }

  meses(deputa: DespesaData) {
    return Object.entries(deputa.porMes).map(([key, valor]) => {
      const [ano, mes] = key.split('-');
      const label = new Date(+ano, +mes - 1).toLocaleDateString('pt-BR', {
        month: 'short',
        year: '2-digit',
      });
      return { key, label, valor };
    });
  }

  tipos(deputa: DespesaData) {
    const barClasses = ['bg-amber-400', 'bg-teal-400', 'bg-purple-400', 'bg-rose-400'];
    return Object.entries(deputa.porTipoDespesa).map(([nome, { total, quantidade }], i) => ({
      nome: nome
        .replace(/\.$/, '')
        .toLowerCase()
        .replace(/^\w/, (c) => c.toUpperCase()),
      total,
      quantidade,
      barClass: barClasses[i % barClasses.length],
    }));
  }

  private formatCpfCnpj(value: string): string {
    if (!value) return 'Sem Identificação';

    const digits = value.replace(/\D/g, '');

    if (digits.length === 11) {
      const cpf = digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

      return `CPF: ${cpf}`;
    }

    if (digits.length === 14) {
      const cnpj = digits
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');

      return `CNPJ: ${cnpj}`;
    }

    return digits;
  }

  fornecedoresOrdenados(deputa: DespesaData) {
    return Object.entries(deputa.porFornecedor)
      .map(([nome, { total, quantidade, cnpjCpfFornecedor }]) => ({
        nome,
        total,
        quantidade,
        cnpjCpfFornecedor: this.formatCpfCnpj(cnpjCpfFornecedor),
      }))
      .sort((a, b) => b.total - a.total);
  }
}
