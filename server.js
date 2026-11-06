const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Database / State Store
let nfeDatabase = {};

// Helper: Generate Mock NF-e Data for CNPJ
function generateMockNotes(cnpj) {
  const cleanCnpj = cnpj.replace(/\D/g, '');
  if (!nfeDatabase[cleanCnpj]) {
    nfeDatabase[cleanCnpj] = [
      {
        chave: `352601${cleanCnpj.padStart(14, '0')}550010000458121987654321`,
        numero: '45812',
        serie: '1',
        emitenteRazao: 'Distribuidora Nacional de Alimentos Ltda',
        emitenteCnpj: '12.345.678/0001-95',
        dataEmissao: '2026-11-01T10:30:00-03:00',
        valorTotal: 14850.00,
        situacaoManifestacao: 'Sem Manifestação',
        statusSefaz: 'Autorizada',
        items: [
          { codigo: 'PRD-001', descricao: 'Caixa de Leite Integral 1L (c/ 12)', qtd: 100, valorUnit: 48.50, valorTotal: 4850.00 },
          { codigo: 'PRD-002', descricao: 'Fardo de Açúcar Refinado 5kg', qtd: 200, valorUnit: 50.00, valorTotal: 10000.00 }
        ]
      },
      {
        chave: `352602${cleanCnpj.padStart(14, '0')}550010000987151234567890`,
        numero: '98715',
        serie: '1',
        emitenteRazao: 'TechLog Soluções em Logística S.A.',
        emitenteCnpj: '98.765.432/0001-10',
        dataEmissao: '2026-11-04T14:15:00-03:00',
        valorTotal: 3250.75,
        situacaoManifestacao: 'Confirmação da Operação',
        statusSefaz: 'Autorizada',
        items: [
          { codigo: 'SER-102', descricao: 'Serviço de Frete Rodoviário Intermunicipal', qtd: 1, valorUnit: 3250.75, valorTotal: 3250.75 }
        ]
      },
      {
        chave: `352603${cleanCnpj.padStart(14, '0')}550010000112231998877665`,
        numero: '11223',
        serie: '2',
        emitenteRazao: 'Indústria Metálurgica Paulista Eireli',
        emitenteCnpj: '44.555.666/0001-22',
        dataEmissao: '2026-11-05T09:00:00-03:00',
        valorTotal: 28900.00,
        situacaoManifestacao: 'Desconhecimento da Operação',
        statusSefaz: 'Autorizada',
        items: [
          { codigo: 'MAT-99', descricao: 'Chapa de Aço Galvanizado 2mm x 1200mm', qtd: 50, valorUnit: 578.00, valorTotal: 28900.00 }
        ]
      }
    ];
  }
  return nfeDatabase[cleanCnpj];
}

// API Routes

// 1. Search NF-e by CNPJ
app.get('/api/nfe/consulta/:cnpj', (req, res) => {
  const cnpj = req.params.cnpj.replace(/\D/g, '');
  if (cnpj.length !== 14) {
    return res.status(400).json({ error: 'CNPJ inválido. Forneça exatamente 14 dígitos.' });
  }

  const notes = generateMockNotes(cnpj);
  res.json({
    sucesso: true,
    cnpj: cnpj,
    totalNotas: notes.length,
    notas: notes
  });
});

// 2. Manifest NF-e (Confirmação, Rejeição, Desconhecimento, Operação não Realizada)
app.post('/api/nfe/manifestar', (req, res) => {
  const { cnpj, chave, tipoManifestacao, justificativa } = req.body;
  const cleanCnpj = (cnpj || '').replace(/\D/g, '');

  if (!cleanCnpj || !chave || !tipoManifestacao) {
    return res.status(400).json({ error: 'Parâmetros obrigatórios ausentes (cnpj, chave, tipoManifestacao).' });
  }

  const validTypes = [
    'Confirmação da Operação',
    'Desconhecimento da Operação',
    'Operação não Realizada',
    'Ciência da Emissão'
  ];

  if (!validTypes.includes(tipoManifestacao)) {
    return res.status(400).json({ error: 'Tipo de manifestação inválido.' });
  }

  const notes = generateMockNotes(cleanCnpj);
  const note = notes.find(n => n.chave === chave);

  if (!note) {
    return res.status(404).json({ error: 'Nota fiscal não encontrada para este CNPJ.' });
  }

  // Update status
  note.situacaoManifestacao = tipoManifestacao;
  if (justificativa) note.justificativa = justificativa;
  note.dataManifestacao = new Date().toISOString();

  res.json({
    sucesso: true,
    mensagem: `Manifestação [${tipoManifestacao}] registrada com sucesso na SEFAZ via WebService MDE.`,
    protocolo: `33526${Math.floor(100000000000 + Math.random() * 900000000000)}`,
    nota: note
  });
});

// 3. Download XML Mock
app.get('/api/nfe/download/xml/:chave', (req, res) => {
  const chave = req.params.chave;
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe>
    <infNFe Id="NFe${chave}" versao="4.00">
      <ide>
        <cUF>35</cUF>
        <cNF>04581219</cNF>
        <natOp>VENDA DE MERCADORIA</natOp>
        <mod>55</mod>
        <serie>1</serie>
        <nNF>45812</nNF>
        <dhEmi>2026-11-01T10:30:00-03:00</dhEmi>
        <tpNF>1</tpNF>
      </ide>
      <emit>
        <CNPJ>12345678000195</CNPJ>
        <xNome>Distribuidora Nacional de Alimentos Ltda</xNome>
      </emit>
      <dest>
        <CNPJ>${chave.substring(6, 20)}</CNPJ>
        <xNome>Empresa Destinatária S.A.</xNome>
      </dest>
      <total>
        <ICMSTot>
          <vNF>14850.00</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
  <protNFe versao="4.00">
    <infProt>
      <tpAmb>1</tpAmb>
      <verAplic>SP_NFE_PL_009_V4</verAplic>
      <chNFe>${chave}</chNFe>
      <dhRecbto>2026-11-01T10:30:15-03:00</dhRecbto>
      <nProt>135260009876543</nProt>
      <digVal>aB3x9kL1p=</digVal>
      <cStat>100</cStat>
      <xMotivo>Autorizado o uso da NF-e</xMotivo>
    </infProt>
  </protNFe>
</nfeProc>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Content-Disposition', `attachment; filename=NFe_${chave}.xml`);
  res.send(xmlContent);
});

app.listen(PORT, () => {
  console.log(`[Finder Enterprise] Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});
