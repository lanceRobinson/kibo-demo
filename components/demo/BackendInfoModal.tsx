import { useState } from 'react'

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material'

const HAZMAT_CODE = `module.exports = function(context, callback) {
  try {
    var order = context.get.order();
    var items = order.items || [];

    var hasHazmat = items.some(function(item) {
      var properties = (item.product && item.product.properties) || [];
      return properties.some(function(prop) {
        return prop.attributeFQN === 'Tenant~hazmat-product' &&
          prop.values && prop.values.some(function(v) {
            return v.value === true || v.value === 'true';
          });
      });
    });

    if (hasHazmat) {
      context.exec.setAttribute('tenant~hazmat', [true]);
    }
  } catch (e) {
    console.log('[hazmat] Error: ' + e.message);
  }

  callback();
};`

const ERP_CODE = `var https = require('https');

module.exports = function(context, callback) {
  try {
    var order = context.get.order();

    var body = JSON.stringify({
      orderNumber: order.orderNumber,
      orderId: order.id,
      status: order.status,
      submittedDate: order.submittedDate,
      total: order.total,
      items: (order.items || []).map(function(item) {
        return {
          productCode: item.product && item.product.productCode,
          name: item.product && item.product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice && item.unitPrice.listAmount,
        };
      }),
      fulfillmentInfo: order.fulfillmentInfo,
      billingInfo: order.billingInfo,
    });

    var req = https.request({
      hostname: 'your-erp.example.com',
      path: '/api/orders/inbound',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, function(res) {
      console.log('[erp] Response: ' + res.statusCode);
    });

    req.write(body);
    req.end();
  } catch (e) {
    console.log('[erp] Error: ' + e.message);
  }

  callback();
};`

const WEBHOOK_PAYLOAD = {
  topic: 'order.opened',
  entityId: 'ord-5f8a2c19e4b0',
  tenantId: 43262,
  siteId: 65808,
  timestamp: '2026-05-06T14:32:10.000Z',
  correlationId: 'corr-d7e91b34f2a0',
  body: {
    id: 'ord-5f8a2c19e4b0',
    orderNumber: 1042,
    status: 'Open',
    submittedDate: '2026-05-06T14:32:09.000Z',
    total: 1847.5,
    email: 'tim.allen@midpoint.com',
    attributes: [
      {
        fullyQualifiedName: 'tenant~customer-po-number',
        values: ['PO-2024-8847'],
      },
      {
        fullyQualifiedName: 'tenant~cost-center-code',
        values: ['CC-MAINT-042'],
      },
      {
        fullyQualifiedName: 'tenant~hazmat',
        values: [true],
      },
      {
        fullyQualifiedName: 'tenant~sales-rep-override',
        values: ['SR-WEST-12'],
      },
    ],
    items: [
      {
        productCode: 'BOLT-HEX-M8',
        name: 'Hex Bolt M8 x 25mm (100-pack)',
        quantity: 10,
        unitPrice: 12.5,
      },
      {
        productCode: 'AERO-CAN-001',
        name: 'Industrial Solvent Spray (Hazmat)',
        quantity: 5,
        unitPrice: 284.5,
      },
    ],
  },
}

const HIGHLIGHT_KEYS = [
  'tenant~customer-po-number',
  'tenant~cost-center-code',
  'tenant~hazmat',
  'tenant~sales-rep-override',
]

const HIGHLIGHT_LABELS: Record<string, string> = {
  'tenant~customer-po-number': 'Customer PO Number',
  'tenant~cost-center-code': 'Cost Center Code',
  'tenant~hazmat': 'Hazmat Flag',
  'tenant~sales-rep-override': 'Sales Rep Override',
}

const HIGHLIGHT_COLORS: Record<string, string> = {
  'tenant~customer-po-number': '#FFD54F',
  'tenant~cost-center-code': '#80DEEA',
  'tenant~hazmat': '#EF9A9A',
  'tenant~sales-rep-override': '#A5D6A7',
}

function getHighlightKey(line: string): string | null {
  for (const key of HIGHLIGHT_KEYS) {
    if (line.includes(key)) return key
  }
  return null
}

function isHighlightedValueLine(lines: string[], idx: number): string | null {
  for (let i = idx - 1; i >= Math.max(0, idx - 4); i--) {
    const key = getHighlightKey(lines[i])
    if (key) return key
  }
  return null
}

function HighlightedJson({ json }: { json: object }) {
  const raw = JSON.stringify(json, null, 2)
  const lines = raw.split('\n')

  return (
    <Box
      component="pre"
      sx={{
        m: 0,
        p: 2,
        backgroundColor: '#1E1E1E',
        borderRadius: 1,
        fontSize: '0.75rem',
        lineHeight: 1.7,
        overflow: 'auto',
        fontFamily: 'monospace',
        whiteSpace: 'pre',
      }}
    >
      {lines.map((line, i) => {
        const directKey = getHighlightKey(line)
        const parentKey = !directKey ? isHighlightedValueLine(lines, i) : null
        const activeKey = directKey || parentKey

        if (activeKey) {
          return (
            <Box
              key={i}
              component="span"
              sx={{
                display: 'block',
                backgroundColor: HIGHLIGHT_COLORS[activeKey] + '22',
                borderLeft: directKey ? `3px solid ${HIGHLIGHT_COLORS[activeKey]}` : 'none',
                pl: directKey ? '5px' : 0,
              }}
            >
              <Box component="span" sx={{ color: HIGHLIGHT_COLORS[activeKey], fontWeight: 700 }}>
                {line}
              </Box>
              {directKey && (
                <Box
                  component="span"
                  sx={{
                    ml: 1,
                    fontSize: '0.6rem',
                    backgroundColor: HIGHLIGHT_COLORS[directKey],
                    color: '#000',
                    borderRadius: '3px',
                    px: 0.5,
                    py: 0.1,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    verticalAlign: 'middle',
                  }}
                >
                  {HIGHLIGHT_LABELS[directKey]}
                </Box>
              )}
              {'\n'}
            </Box>
          )
        }

        return (
          <Box key={i} component="span" sx={{ display: 'block', color: '#D4D4D4' }}>
            {line}
            {'\n'}
          </Box>
        )
      })}
    </Box>
  )
}

function CodeBlock({ code }: { code: string }) {
  return (
    <Box
      component="pre"
      sx={{
        m: 0,
        p: 2,
        backgroundColor: '#1E1E1E',
        color: '#D4D4D4',
        borderRadius: 1,
        fontSize: '0.75rem',
        lineHeight: 1.7,
        overflow: 'auto',
        fontFamily: 'monospace',
        whiteSpace: 'pre',
      }}
    >
      {code}
    </Box>
  )
}

type Tab = 'hazmat' | 'erp' | 'webhook'

const TABS: { id: Tab; label: string; event: string; color: string }[] = [
  {
    id: 'hazmat',
    label: 'Update Hazmat Attribute',
    event: 'embedded.commerce.orders.action.before',
    color: '#EF9A9A',
  },
  {
    id: 'erp',
    label: 'API Call to ERP',
    event: 'embedded.commerce.orders.action.after',
    color: '#80DEEA',
  },
  {
    id: 'webhook',
    label: 'Event Webhook to WMS',
    event: 'order.opened',
    color: '#A5D6A7',
  },
]

export default function BackendInfoModal() {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('hazmat')

  return (
    <>
      <IconButton
        onClick={() => setOpen(true)}
        size="small"
        sx={{ p: 0.25, color: 'text.secondary', verticalAlign: 'middle' }}
        aria-label="What's happening in the back end"
      >
        <InfoOutlinedIcon sx={{ fontSize: '1.4rem' }} />
      </IconButton>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2, overflow: 'hidden' } }}
      >
        <DialogTitle
          sx={{
            backgroundColor: '#1F2A44',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 1.5,
            px: 3,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              What&apos;s Happening in the Back End
            </Typography>
            <Typography variant="caption" sx={{ color: '#90CAF9', fontSize: '0.7rem' }}>
              Kibo API Extensions &amp; Event Webhooks
            </Typography>
          </Box>
          <IconButton onClick={() => setOpen(false)} sx={{ color: '#fff' }}>
            <Typography sx={{ fontSize: '1.1rem', lineHeight: 1 }}>✕</Typography>
          </IconButton>
        </DialogTitle>

        {/* Tab buttons */}
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            px: 3,
            py: 2,
            backgroundColor: '#F5F5F5',
            borderBottom: '1px solid #E0E0E0',
            flexWrap: 'wrap',
          }}
        >
          {TABS.map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              variant={activeTab === tab.id ? 'contained' : 'outlined'}
              sx={{
                flex: 1,
                minWidth: 160,
                py: 1.5,
                fontWeight: 700,
                fontSize: '0.8rem',
                textTransform: 'none',
                borderRadius: 2,
                backgroundColor: activeTab === tab.id ? '#1F2A44' : 'transparent',
                borderColor: '#1F2A44',
                color: activeTab === tab.id ? '#fff' : '#1F2A44',
                '&:hover': {
                  backgroundColor: activeTab === tab.id ? '#2F4A6D' : '#E6E9ED',
                  borderColor: '#1F2A44',
                },
              }}
            >
              <Box>
                <Box>{tab.label}</Box>
                <Box
                  component="span"
                  sx={{
                    fontSize: '0.6rem',
                    fontWeight: 400,
                    color: activeTab === tab.id ? tab.color : '#888',
                    display: 'block',
                    mt: 0.25,
                    fontFamily: 'monospace',
                  }}
                >
                  {tab.event}
                </Box>
              </Box>
            </Button>
          ))}
        </Box>

        <DialogContent sx={{ p: 3, backgroundColor: '#FAFAFA' }}>
          {activeTab === 'hazmat' && (
            <Box>
              <Typography variant="body2" sx={{ mb: 1.5, color: '#555' }}>
                Before an order action completes, Kibo invokes this API Extension function. It
                inspects each line item&apos;s product attributes and sets the order-level{' '}
                <Box component="code" sx={{ backgroundColor: '#eee', px: 0.5, borderRadius: 0.5 }}>
                  tenant~hazmat
                </Box>{' '}
                flag to <strong>true</strong> if any item carries a hazmat designation.
              </Typography>
              <CodeBlock code={HAZMAT_CODE} />
            </Box>
          )}

          {activeTab === 'erp' && (
            <Box>
              <Typography variant="body2" sx={{ mb: 1.5, color: '#555' }}>
                After the order action completes, this API Extension fires asynchronously and POSTs
                a structured order payload to the ERP system — including line items, fulfillment,
                and billing details.
              </Typography>
              <CodeBlock code={ERP_CODE} />
            </Box>
          )}

          {activeTab === 'webhook' && (
            <Box>
              <Typography variant="body2" sx={{ mb: 1, color: '#555' }}>
                When an order opens, Kibo emits an{' '}
                <Box component="code" sx={{ backgroundColor: '#eee', px: 0.5, borderRadius: 0.5 }}>
                  order.opened
                </Box>{' '}
                push webhook to the registered WMS endpoint. The payload includes all order
                attributes — highlighted below are the B2B-specific fields captured at checkout.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                {HIGHLIGHT_KEYS.map((key) => (
                  <Box
                    key={key}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      fontSize: '0.7rem',
                    }}
                  >
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '2px',
                        backgroundColor: HIGHLIGHT_COLORS[key],
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant="caption" sx={{ color: '#555' }}>
                      {HIGHLIGHT_LABELS[key]}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <HighlightedJson json={WEBHOOK_PAYLOAD} />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
