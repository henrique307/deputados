import { Component, computed, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MoneyBanner } from './money-banner/money-banner';
import { DeputadosList } from './deputados-list/deputados-list';
import { ultimoMes } from '../lib/format';
import { Meta, Title } from '@angular/platform-browser';
import { readDataFromDatabase } from '../lib/readDataFromDatabase';
import { Despesa } from '../data/deputados';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, ReactiveFormsModule, MoneyBanner, DeputadosList],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('deputados_webapp');

  constructor(
    private meta: Meta,
    private seoTitle: Title,
  ) {}

  pesquisa = new FormControl('');
  despesas = signal<Despesa[]>([]);

  mesRef = computed(
    () =>
      this.despesas()
        .map((d) => ultimoMes(d.porMes))
        .filter(Boolean)
        .sort()
        .pop() ?? '2025-12',
  );

  totalMes = computed(() => this.despesas().reduce((acc, d) => acc + (d.totalGeral ?? 0), 0));

  async ngOnInit() {
    this.seoTitle.setTitle('deputados — Gastos parlamentares dos deputados federais');

    this.meta.updateTag({
      name: 'description',
      content:
        'Acompanhe os gastos declarados pelos deputados federais com a Cota para o Exercício da Atividade Parlamentar (CEAP). Dados abertos com transparência.',
    });

    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({
      name: 'keywords',
      content:
        'gastos parlamentares, CEAP, cota parlamentar, deputados federais, transparência, câmara dos deputados',
    });
    this.meta.updateTag({ name: 'author', content: 'deputados' });
    this.meta.updateTag({ name: 'canonical', content: 'https://deputados.com.br' });
    this.meta.updateTag({ charset: 'UTF-8' });
    this.meta.updateTag({ name: 'viewport', content: 'width=device-width, initial-scale=1' });

    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: 'deputados' });
    this.meta.updateTag({ property: 'og:locale', content: 'pt_BR' });
    this.meta.updateTag({ property: 'og:url', content: 'https://deputados.com.br' });
    this.meta.updateTag({
      property: 'og:title',
      content: 'deputados — Gastos parlamentares dos deputados federais',
    });
    this.meta.updateTag({
      property: 'og:description',
      content:
        'Acompanhe os gastos declarados pelos deputados federais com a cota parlamentar (CEAP). Dados abertos com transparência.',
    });
    this.meta.updateTag({ property: 'og:image', content: 'https://deputados.com.br/og-image.png' });
    this.meta.updateTag({ property: 'og:image:width', content: '1200' });
    this.meta.updateTag({ property: 'og:image:height', content: '630' });

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({
      name: 'twitter:title',
      content: 'deputados — Gastos parlamentares dos deputados federais',
    });
    this.meta.updateTag({
      name: 'twitter:description',
      content:
        'Acompanhe os gastos declarados pelos deputados federais com a cota parlamentar (CEAP). Dados abertos com transparência.',
    });
    this.meta.updateTag({ name: 'twitter:image', content: 'https://deputados.com.br/og-image.png' });

    const data: Despesa[] = (await readDataFromDatabase('/')).despesas;

    this.despesas.set(data);
  }

  initials(deputa: Despesa): string {
    return deputa.nome
      .split(' ')
      .filter((n) => n.length > 2)
      .slice(0, 2)
      .map((n) => n[0])
      .join('');
  }

  meses(deputa: Despesa) {
    return Object.entries(deputa.porMes).map(([key, valor]) => {
      const [ano, mes] = key.split('-');
      const label = new Date(+ano, +mes - 1).toLocaleDateString('pt-BR', {
        month: 'short',
        year: '2-digit',
      });
      return { key, label, valor };
    });
  }

  tipos(deputa: Despesa) {
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

  fornecedoresOrdenados(deputa: Despesa) {
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
